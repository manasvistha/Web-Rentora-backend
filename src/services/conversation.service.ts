import { ConversationRepository } from "../repositories/conversation.repository";
import { NotificationService } from "./notification.service";
import { CreateConversationDto, SendMessageDto } from "../dtos/conversation.dto";

export class ConversationService {
  private conversationRepository = new ConversationRepository();
  private notificationService = new NotificationService();

  async createConversation(data: CreateConversationDto) {
    // Check if conversation already exists
    const existing = await this.conversationRepository.findByParticipants(data.participants);
    if (existing) return existing;

    return await this.conversationRepository.create(data);
  }

  async getConversationsByUser(userId: string) {
    return await this.conversationRepository.findByUser(userId);
  }

  async sendMessage(data: SendMessageDto, senderId: string) {
    const conversation = await this.conversationRepository.addMessage(data.conversationId, senderId, data.content);
    if (conversation) {
      // Notify other participants
      const otherParticipants = conversation.participants.filter(p => p._id.toString() !== senderId);
      for (const participant of otherParticipants) {
        await this.notificationService.createNotification(
          participant._id.toString(),
          `New message in conversation.`,
          'message',
          data.conversationId
        );
      }
    }
    return conversation;
  }

  async getConversationById(id: string, userId: string) {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation || !conversation.participants.some(p => p._id.toString() === userId)) {
      throw new Error("Conversation not found or unauthorized");
    }
    return conversation;
  }
}