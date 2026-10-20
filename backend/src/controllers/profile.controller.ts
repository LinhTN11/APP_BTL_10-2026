import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            interests: {
              include: { interest: true },
            },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Chưa khởi tạo hồ sơ' });
      return;
    }

    // Check 24-hour mood validity
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const isMoodValid = !!(profile.moodUpdatedAt && profile.moodUpdatedAt > twentyFourHoursAgo);

    res.status(200).json({
      success: true,
      profile: {
        ...profile,
        isMoodActive: isMoodValid,
        activeDailyMood: isMoodValid ? profile.dailyMood : null,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin hồ sơ.' });
  }
}

export async function getProfileById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'userId là bắt buộc' });
      return;
    }

    const candidateProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            interests: {
              include: { interest: true },
            },
          },
        },
      },
    });

    if (!candidateProfile) {
      res.status(404).json({ error: 'Không tìm thấy hồ sơ người dùng.' });
      return;
    }

    // Compute age
    const now = new Date();
    const birthDate = new Date(candidateProfile.birthDate);
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check 24h mood validity
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const isMoodValid =
      candidateProfile.moodUpdatedAt && candidateProfile.moodUpdatedAt > twentyFourHoursAgo;

    res.status(200).json({
      success: true,
      profile: {
        id: candidateProfile.userId,
        fullName: candidateProfile.fullName,
        gender: candidateProfile.gender,
        age,
        heightCm: candidateProfile.heightCm,
        bio: candidateProfile.bio,
        mbtiType: candidateProfile.mbtiType,
        dailyMood: isMoodValid ? candidateProfile.dailyMood : null,
        avatarUrl: candidateProfile.avatarUrl,
        photos: candidateProfile.photos,
        interests: candidateProfile.user.interests.map((ui) => ({
          id: ui.interest.id,
          name: ui.interest.name,
          iconName: ui.interest.iconName,
          category: ui.interest.category,
        })),
      },
    });
  } catch (error) {
    console.error('Get Profile By ID Error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin hồ sơ người dùng.' });
  }
}

export async function getInterests(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: { id: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    console.error('Get Interests Error:', error);
    res.status(500).json({ error: 'Lỗi tải danh mục sở thích.' });
  }
}

export async function createOrUpdateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const {
      fullName,
      gender,
      birthDate,
      heightCm,
      bio,
      mbtiType,
      dailyMood,
      photos,
      avatarUrl,
      interestIds,
      latitude,
      longitude,
      maxDistanceKm,
      ageMin,
      ageMax,
    } = req.body;

    const profileData = {
      fullName,
      gender,
      birthDate: new Date(birthDate),
      heightCm: heightCm ? parseInt(heightCm, 10) : null,
      bio,
      mbtiType,
      dailyMood,
      moodUpdatedAt: dailyMood ? new Date() : undefined,
      photos: photos || [],
      avatarUrl: avatarUrl || (photos && photos.length > 0 ? photos[0] : null),
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      maxDistanceKm: maxDistanceKm ? parseInt(maxDistanceKm, 10) : undefined,
      ageMin: ageMin ? parseInt(ageMin, 10) : undefined,
      ageMax: ageMax ? parseInt(ageMax, 10) : undefined,
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
      },
      update: profileData,
    });

    // Update interests if provided
    if (Array.isArray(interestIds)) {
      await prisma.userInterest.deleteMany({ where: { userId } });
      if (interestIds.length > 0) {
        await prisma.userInterest.createMany({
          data: interestIds.map((id: number) => ({
            userId,
            interestId: id,
          })),
        });
      }
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật hồ sơ cá nhân.' });
  }
}

export async function updatePreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { maxDistanceKm, ageMin, ageMax } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const updateData: any = {};
    if (maxDistanceKm !== undefined) updateData.maxDistanceKm = parseInt(maxDistanceKm, 10);
    if (ageMin !== undefined) updateData.ageMin = parseInt(ageMin, 10);
    if (ageMax !== undefined) updateData.ageMax = parseInt(ageMax, 10);

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật bộ lọc tìm kiếm thành công',
      preferences: {
        maxDistanceKm: profile.maxDistanceKm,
        ageMin: profile.ageMin,
        ageMax: profile.ageMax,
      },
    });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật cài đặt tìm kiếm.' });
  }
}

export async function uploadPhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { imageUrl, imageBase64, isAvatar } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    // Support both direct URL or base64 data URI
    let finalUrl = imageUrl;
    if (!finalUrl && imageBase64) {
      // In production/cloud this uploads to Cloudinary or S3.
      // In local dev/MVP, store data URI or mock CDN URL.
      finalUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
    }

    if (!finalUrl) {
      res.status(400).json({ error: 'Vui lòng cung cấp imageUrl hoặc imageBase64.' });
      return;
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Chưa khởi tạo hồ sơ.' });
      return;
    }

    // Max 6 photos as per spec
    const existingPhotos = profile.photos || [];
    let updatedPhotos = [...existingPhotos];
    if (!updatedPhotos.includes(finalUrl)) {
      if (updatedPhotos.length >= 6) {
        res.status(400).json({ error: 'Bạn chỉ có thể tải lên tối đa 6 ảnh hồ sơ.' });
        return;
      }
      updatedPhotos.push(finalUrl);
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        photos: updatedPhotos,
        avatarUrl: isAvatar || !profile.avatarUrl ? finalUrl : profile.avatarUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Tải ảnh lên thành công',
      url: finalUrl,
      photos: updatedProfile.photos,
      avatarUrl: updatedProfile.avatarUrl,
    });
  } catch (error) {
    console.error('Upload Photo Error:', error);
    res.status(500).json({ error: 'Lỗi tải ảnh lên hồ sơ.' });
  }
}

export async function updateMbti(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { mbtiType } = req.body;

    if (!mbtiType) {
      res.status(400).json({ error: 'Mã MBTI là bắt buộc' });
      return;
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { mbtiType },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật tính cách MBTI thành công',
      mbtiType: profile.mbtiType,
    });
  } catch (error) {
    console.error('Update MBTI Error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật MBTI.' });
  }
}

export async function updateMood(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { dailyMood } = req.body;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        dailyMood,
        moodUpdatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật nhãn tâm trạng thành công',
      dailyMood: profile.dailyMood,
      updatedAt: profile.moodUpdatedAt,
    });
  } catch (error) {
    console.error('Update Mood Error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật nhãn tâm trạng.' });
  }
}

export async function updateLocation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { latitude, longitude, isVirtualLocation } = req.body;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        isVirtualLocation: !!isVirtualLocation,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật vị trí tọa độ thành công',
      location: {
        latitude: profile.latitude,
        longitude: profile.longitude,
        isVirtualLocation: profile.isVirtualLocation,
      },
    });
  } catch (error) {
    console.error('Update Location Error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật vị trí.' });
  }
}
