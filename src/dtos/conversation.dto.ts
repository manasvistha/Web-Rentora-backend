import z from "zod";

export const CreateConversationSchema = z.object({
  participants: z.array(z.string()).min(2, "At least two participants required")
});

export const SendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, "Message content is required")
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;
export type SendMessageDto = z.infer<typeof SendMessageSchema>;