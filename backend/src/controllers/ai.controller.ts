import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';
import { aiService, UserProfileContext } from '../services/ai.service.js';

export async function getIcebreakers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.userId;
    const { matchId, conversationId } = req.body;

    if (!currentUserId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const targetId = matchId || conversationId;
    if (!targetId) {
      res.status(400).json({ error: 'matchId hoặc conversationId là bắt buộc' });
      return;
    }

    // 1. Fetch match flexibly (supporting both Match.id and Conversation.id)
    let match = await prisma.match.findUnique({
      where: { id: targetId },
      include: {
        user1: {
          include: {
            profile: true,
            interests: { include: { interest: true } },
          },
        },
        user2: {
          include: {
            profile: true,
            interests: { include: { interest: true } },
          },
        },
      },
    });

    if (!match) {
      // Check if targetId is actually a conversation ID
      const conv = await prisma.conversation.findUnique({
        where: { id: targetId },
        include: {
          match: {
            include: {
              user1: {
                include: {
                  profile: true,
                  interests: { include: { interest: true } },
                },
              },
              user2: {
                include: {
                  profile: true,
                  interests: { include: { interest: true } },
                },
              },
            },
          },
        },
      });
      match = conv?.match || null;
    }

    if (!match || !match.isActive) {
      res.status(404).json({ error: 'Không tìm thấy cuộc Match hoặc cuộc Match đã kết thúc.' });
      return;
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      res.status(403).json({ error: 'Bạn không có quyền trong cuộc Match này.' });
      return;
    }

    // 2. Map sender and receiver profiles
    const isUser1 = match.user1Id === currentUserId;
    const senderData = isUser1 ? match.user1 : match.user2;
    const receiverData = isUser1 ? match.user2 : match.user1;

    const senderProfile: UserProfileContext = {
      name: senderData.profile?.fullName || 'Tôi',
      gender: senderData.profile?.gender || 'OTHER',
      mbti: senderData.profile?.mbtiType,
      interests: senderData.interests.map((i) => i.interest.name),
      dailyMood: senderData.profile?.dailyMood,
      bio: senderData.profile?.bio,
    };

    const receiverProfile: UserProfileContext = {
      name: receiverData.profile?.fullName || 'Người ấy',
      gender: receiverData.profile?.gender || 'OTHER',
      mbti: receiverData.profile?.mbtiType,
      interests: receiverData.interests.map((i) => i.interest.name),
      dailyMood: receiverData.profile?.dailyMood,
      bio: receiverData.profile?.bio,
    };

    // 3. Generate 3 contextual icebreakers with AI orchestrator
    const result = await aiService.generateIcebreakers(senderProfile, receiverProfile);

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Icebreaker Controller Error:', error);
    res.status(500).json({ error: 'Lỗi sinh câu mở lời từ AI.' });
  }
}
