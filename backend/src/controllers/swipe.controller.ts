import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';
import { getSocketIO } from '../config/socket.js';

export async function handleSwipe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const swiperId = req.user?.userId;
    const { targetUserId, action } = req.body;

    if (!swiperId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    if (!targetUserId || !['LIKE', 'PASS'].includes(action)) {
      res.status(400).json({ error: 'Dữ liệu vuốt không hợp lệ' });
      return;
    }

    // 1. Save or update swipe record
    const swipe = await prisma.swipe.upsert({
      where: {
        swiperId_targetId: {
          swiperId,
          targetId: targetUserId,
        },
      },
      create: {
        swiperId,
        targetId: targetUserId,
        action,
      },
      update: {
        action,
      },
    });

    // If PASS, return immediately
    if (action === 'PASS') {
      res.status(200).json({ success: true, matched: false });
      return;
    }

    // 2. Check if target user already liked current user
    const reciprocalSwipe = await prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: targetUserId,
          targetId: swiperId,
        },
      },
    });

    const isMatch = reciprocalSwipe?.action === 'LIKE';

    if (isMatch) {
      // Determine user1 and user2 to avoid duplicate constraints
      const [user1Id, user2Id] =
        swiperId < targetUserId ? [swiperId, targetUserId] : [targetUserId, swiperId];

      // Create match and conversation if not exists
      let match = await prisma.match.findUnique({
        where: { user1Id_user2Id: { user1Id, user2Id } },
        include: { conversation: true },
      });

      if (!match) {
        match = await prisma.match.create({
          data: {
            user1Id,
            user2Id,
            conversation: {
              create: {},
            },
          },
          include: { conversation: true },
        });
      }

      // Fetch target user profile for rich match response
      const targetProfile = await prisma.profile.findUnique({
        where: { userId: targetUserId },
      });

      const currentProfile = await prisma.profile.findUnique({
        where: { userId: swiperId },
      });

      // Emit real-time match notification to both users via Socket.io
      const socketIO = getSocketIO();
      socketIO?.to(`user_${targetUserId}`).emit('match_notification', {
        matchId: match.id,
        conversationId: match.conversation?.id,
        partner: {
          id: swiperId,
          fullName: currentProfile?.fullName || 'Người dùng bí ẩn',
          avatarUrl: currentProfile?.avatarUrl,
        },
      });

      socketIO?.to(`user_${swiperId}`).emit('match_notification', {
        matchId: match.id,
        conversationId: match.conversation?.id,
        partner: {
          id: targetUserId,
          fullName: targetProfile?.fullName || 'Người dùng bí ẩn',
          avatarUrl: targetProfile?.avatarUrl,
        },
      });

      res.status(200).json({
        success: true,
        matched: true,
        matchId: match.id,
        conversationId: match.conversation?.id,
        matchedUser: {
          id: targetUserId,
          fullName: targetProfile?.fullName,
          avatarUrl: targetProfile?.avatarUrl,
        },
      });
      return;
    }

    res.status(200).json({ success: true, matched: false });
  } catch (error) {
    console.error('Swipe Error:', error);
    res.status(500).json({ error: 'Lỗi thực hiện thao tác vuốt.' });
  }
}
