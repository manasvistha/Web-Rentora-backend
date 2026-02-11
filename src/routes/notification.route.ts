import express from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authorize } from '../middlewears/authorized.middlewears';

const router = express.Router();
const notificationController = new NotificationController();

// Get user's notifications
router.get('/', authorize, notificationController.getMyNotifications);

// Mark notification as read
router.put('/:id/read', authorize, notificationController.markAsRead);

export default router;