import { Server, Socket } from 'socket.io';
import { prisma } from '../config/prisma.js';

export function setupChatSockets(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join user's personal notification room (for match alerts & instant message notifications)
    socket.on('join_user_room', (data: { userId: string }) => {
      if (data?.userId) {
        socket.join(`user_${data.userId}`);
        console.log(`[Socket.io] User ${data.userId} joined personal room.`);
      }
    });

    // Join specific conversation room
    socket.on('join_conversation', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.join(`conv_${data.conversationId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined conversation ${data.conversationId}`);
      }
    });

    // Send real-time chat message
    socket.on(
      'send_message',
      async (data: {
        conversationId: string;
        senderId: string;
        content: string;
        isAiGenerated?: boolean;
      }) => {
        try {
          const { conversationId, senderId, content, isAiGenerated } = data;

          if (!conversationId || !senderId || !content?.trim()) {
            return;
          }

          // Verify conversation exists, is active, and sender is a participant
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { match: true },
          });

          if (!conversation) {
            socket.emit('error_message', { message: 'Không tìm thấy cuộc trò chuyện.' });
            return;
          }

          if (!conversation.match.isActive) {
            socket.emit('error_message', { message: 'Cuộc trò chuyện này đã bị hủy kết nối.' });
            return;
          }

          const isMember =
            conversation.match.user1Id === senderId ||
            conversation.match.user2Id === senderId;

          if (!isMember) {
            socket.emit('error_message', { message: 'Bạn không có quyền gửi tin nhắn trong phòng này.' });
            return;
          }

          // Persist message in database
          const message = await prisma.message.create({
            data: {
              conversationId,
              senderId,
              content: content.trim(),
              isAiGenerated: !!isAiGenerated,
            },
          });

          // Update last message timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
          });

          // Broadcast to everyone in the conversation room
          io.to(`conv_${conversationId}`).emit('receive_message', {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            isAiGenerated: message.isAiGenerated,
            createdAt: message.createdAt,
          });

          // Also emit to partner's personal user room so they get notified if on another tab/screen
          const partnerId =
            conversation.match.user1Id === senderId
              ? conversation.match.user2Id
              : conversation.match.user1Id;

          io.to(`user_${partnerId}`).emit('new_message_notification', {
            conversationId,
            messageId: message.id,
            senderId,
            content: message.content,
            createdAt: message.createdAt,
          });
        } catch (error) {
          console.error('[Socket.io] Error in send_message:', error);
          socket.emit('error_message', { message: 'Không thể gửi tin nhắn' });
        }
      }
    );

    // Typing status indicator
    socket.on(
      'typing_status',
      (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        if (data?.conversationId) {
          socket.to(`conv_${data.conversationId}`).emit('user_typing', {
            userId: data.userId,
            isTyping: data.isTyping,
          });
        }
      }
    );

    // Mark messages as read socket event
    socket.on(
      'mark_read',
      async (data: { conversationId: string; userId: string }) => {
        try {
          if (!data?.conversationId || !data?.userId) return;

          await prisma.message.updateMany({
            where: {
              conversationId: data.conversationId,
              senderId: { not: data.userId },
              isRead: false,
            },
            data: { isRead: true },
          });

          io.to(`conv_${data.conversationId}`).emit('messages_read', {
            conversationId: data.conversationId,
            readBy: data.userId,
          });
        } catch (err) {
          console.error('[Socket.io] Error in mark_read:', err);
        }
      }
    );

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}
