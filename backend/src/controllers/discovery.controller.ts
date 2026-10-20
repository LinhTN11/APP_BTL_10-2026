import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';
import { calculateDistanceKm } from '../utils/haversine.js';

export async function getDiscoveryFeed(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: currentUserId },
    });

    if (!currentProfile) {
      res.status(400).json({ error: 'Vui lòng hoàn thiện hồ sơ trước khi tìm kiếm đối tượng.' });
      return;
    }

    // Parse filter query parameters or fallback to profile preferences
    const queryMaxDistance = req.query.maxDistance
      ? parseFloat(req.query.maxDistance as string)
      : currentProfile.maxDistanceKm;

    const queryAgeMin = req.query.ageMin
      ? parseInt(req.query.ageMin as string, 10)
      : currentProfile.ageMin;

    const queryAgeMax = req.query.ageMax
      ? parseInt(req.query.ageMax as string, 10)
      : currentProfile.ageMax;

    const queryGender = req.query.gender as string | undefined;

    // 1. Get IDs of users already swiped by current user
    const swipedRecords = await prisma.swipe.findMany({
      where: { swiperId: currentUserId },
      select: { targetId: true },
    });

    // 2. Also get IDs of users from unmatched (inactive) matches to never show again (FR-10)
    const inactiveMatches = await prisma.match.findMany({
      where: {
        isActive: false,
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      select: { user1Id: true, user2Id: true },
    });

    const unmatchedUserIds = inactiveMatches.map((m) =>
      m.user1Id === currentUserId ? m.user2Id : m.user1Id
    );

    const excludedUserIds = Array.from(
      new Set([currentUserId, ...swipedRecords.map((s) => s.targetId), ...unmatchedUserIds])
    );

    // 3. Build Prisma query where clause
    const whereClause: any = {
      userId: { notIn: excludedUserIds },
    };

    if (queryGender && queryGender !== 'ALL') {
      whereClause.gender = queryGender;
    }

    // 4. Fetch candidates with completed profiles
    const candidates = await prisma.profile.findMany({
      where: whereClause,
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

    // 5. Filter by distance, compute age, check mood validity (24h), filter by age range
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const feed = candidates
      .map((candidate) => {
        const distanceKm = calculateDistanceKm(
          currentProfile.latitude,
          currentProfile.longitude,
          candidate.latitude,
          candidate.longitude
        );

        // Calculate age
        const birthDate = new Date(candidate.birthDate);
        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--;
        }

        // Check if daily mood is expired
        const isMoodValid =
          candidate.moodUpdatedAt && candidate.moodUpdatedAt > twentyFourHoursAgo;
        const dailyMood = isMoodValid ? candidate.dailyMood : null;

        return {
          id: candidate.userId,
          fullName: candidate.fullName,
          gender: candidate.gender,
          age,
          heightCm: candidate.heightCm,
          bio: candidate.bio,
          mbtiType: candidate.mbtiType,
          dailyMood,
          avatarUrl: candidate.avatarUrl,
          photos: candidate.photos,
          distanceKm,
          interests: candidate.user.interests.map((ui) => ui.interest.name),
        };
      })
      .filter((candidate) => {
        // Distance check
        if (candidate.distanceKm > queryMaxDistance) return false;

        // Age range check
        if (candidate.age < queryAgeMin || candidate.age > queryAgeMax) return false;

        return true;
      });

    res.status(200).json({
      success: true,
      count: feed.length,
      filters: {
        maxDistanceKm: queryMaxDistance,
        ageMin: queryAgeMin,
        ageMax: queryAgeMax,
        gender: queryGender || 'ALL',
      },
      feed,
    });
  } catch (error) {
    console.error('Discovery Feed Error:', error);
    res.status(500).json({ error: 'Lỗi tải danh sách đối tượng tiềm năng.' });
  }
}
