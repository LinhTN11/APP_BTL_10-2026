import { Router } from 'express';
import {
  getConversations,
  getMessages,
  markMessagesAsRead,
  unmatch,
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.put('/conversations/:conversationId/read', markMessagesAsRead);
router.post('/unmatch', unmatch);

export default router;
