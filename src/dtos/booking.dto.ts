import z from "zod";

export const CreateBookingSchema = z.object({
  propertyId: z.string(),
  message: z.string().optional()
});

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;