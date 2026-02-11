import express from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { authorize } from '../middlewears/authorized.middlewears';

const router = express.Router();
const conversationController = new ConversationController();

// Get user's conversations
router.get('/', authorize, conversationController.getMyConversations);

// Get specific conversation
router.get('/:id', authorize, conversationController.getConversationById);

// Send message in conversation
router.post('/:id/message', authorize, conversationController.sendMessage);

export default router;