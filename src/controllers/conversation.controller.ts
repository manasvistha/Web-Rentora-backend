import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service";
import { CreateConversationDto, SendMessageDto } from "../dtos/conversation.dto";

export class ConversationController {
  private conversationService = new ConversationService();

  async createConversation(req: Request, res: Response) {
    try {
      const data: CreateConversationDto = req.body;
      const conversation = await this.conversationService.createConversation(data);
      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const conversations = await this.conversationService.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const data: SendMessageDto = req.body;
      const senderId = (req as any).user.id;
      const conversation = await this.conversationService.sendMessage(data, senderId);
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getConversationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const conversation = await this.conversationService.getConversationById(id, userId);
      res.json(conversation);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}