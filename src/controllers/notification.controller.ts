import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  private notificationService = new NotificationService();

  async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notifications = await this.notificationService.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const notification = await this.notificationService.markAsRead(id, userId);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await this.notificationService.markAllAsRead(userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}