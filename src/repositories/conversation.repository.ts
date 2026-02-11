import Conversation, { IConversation } from "../models/conversation.model";
import { CreateConversationDto, SendMessageDto } from "../dtos/conversation.dto";

export class ConversationRepository {
  async create(data: CreateConversationDto): Promise<IConversation> {
    const conversation = new Conversation({
      participants: data.participants
    });
    return await conversation.save();
  }

  async findByParticipants(participants: string[]): Promise<IConversation | null> {
    return await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    }).populate('participants', 'name email');
  }

  async findByUser(userId: string): Promise<IConversation[]> {
    return await Conversation.find({
      participants: userId
    }).populate('participants', 'name email').sort({ lastMessageTime: -1 });
  }

  async addMessage(conversationId: string, senderId: string, content: string): Promise<IConversation | null> {
    const message = {
      sender: senderId,
      content,
      timestamp: new Date()
    };
    return await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $push: { messages: message },
        lastMessage: content,
        lastMessageTime: new Date()
      },
      { new: true }
    ).populate('participants', 'name email');
  }

  async findById(id: string): Promise<IConversation | null> {
    return await Conversation.findById(id).populate('participants', 'name email');
  }
}