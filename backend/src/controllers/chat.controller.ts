import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';
import { getSocketIO } from '../config/socket.js';

export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const matches = await prisma.match.findMany({
      where: {
        isActive: true,
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        user1: { include: { profile: true } },
        user2: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversations = matches.map((m) => {
      const isUser1 = m.user1Id === currentUserId;
      const partner = isUser1 ? m.user2 : m.user1;
      const lastMessage = m.conversation?.messages[0] || null;

      return {
        matchId: m.id,
        conversationId: m.conversation?.id,
        createdAt: m.createdAt,
        partner: {
          id: partner.id,
          fullName: partner.profile?.fullName || 'Người dùng',
          avatarUrl: partner.profile?.avatarUrl || null,
          mbtiType: partner.profile?.mbtiType || null,
          dailyMood: partner.profile?.dailyMood || null,
        },
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              isMe: lastMessage.senderId === currentUserId,
              isRead: lastMessage.isRead,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    });

    res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({ error: 'Lỗi tải danh sách cuộc trò chuyện.' });
  }
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.userId;
    const { conversationId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
      return;
    }

    // Check membership
    const isMember =
      conversation.match.user1Id === currentUserId ||
      conversation.match.user2Id === currentUserId;

    if (!isMember) {
      res.status(403).json({ error: 'Bạn không có quyền truy cập cuộc trò chuyện này.' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      matchId: conversation.matchId,
      isActive: conversation.match.isActive,
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        isMe: msg.senderId === currentUserId,
        isRead: msg.isRead,
        isAiGenerated: msg.isAiGenerated,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ error: 'Lỗi tải lịch sử tin nhắn.' });
  }
}

export async function markMessagesAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.userId;
    const { conversationId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
      return;
    }

    const isMember =
      conversation.match.user1Id === currentUserId ||
      conversation.match.user2Id === currentUserId;

    if (!isMember) {
      res.status(403).json({ error: 'Không có quyền truy cập.' });
      return;
    }

    // Update unread messages sent by the partner
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Notify room via socket
    getSocketIO()?.to(`conv_${conversationId}`).emit('messages_read', {
      conversationId,
      readBy: currentUserId,
    });

    res.status(200).json({ success: true, message: 'Đã đánh dấu đã đọc.' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ error: 'Lỗi đánh dấu tin nhắn đã đọc.' });
  }
}

export async function unmatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.userId;
    const { matchId } = req.body;

    if (!currentUserId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { conversation: true },
    });

    if (!match) {
      res.status(404).json({ error: 'Không tìm thấy kết nối ghép đôi' });
      return;
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      res.status(403).json({ error: 'Không có quyền thực hiện huỷ kết nối này.' });
      return;
    }

    await prisma.match.update({
      where: { id: matchId },
      data: { isActive: false },
    });

    // Emit real-time unmatch notification to both users to close conversation immediately
    const socketIO = getSocketIO();
    if (match.conversation?.id) {
      socketIO?.to(`conv_${match.conversation.id}`).emit('match_unmatched', {
        matchId,
        conversationId: match.conversation.id,
      });
    }

    socketIO?.to(`user_${match.user1Id}`).emit('match_unmatched', { matchId });
    socketIO?.to(`user_${match.user2Id}`).emit('match_unmatched', { matchId });

    res.status(200).json({ success: true, message: 'Đã huỷ ghép đôi thành công.' });
  } catch (error) {
    console.error('Unmatch Error:', error);
    res.status(500).json({ error: 'Lỗi huỷ kết nối.' });
  }
}
