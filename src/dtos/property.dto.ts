import z from "zod";

export const CreatePropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  price: z.number().positive("Price must be positive"),
  availability: z.array(z.object({
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str))
  })).min(1, "At least one availability period is required"),
  images: z.array(z.string()).optional()
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

export type CreatePropertyDto = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyDto = z.infer<typeof UpdatePropertySchema>;