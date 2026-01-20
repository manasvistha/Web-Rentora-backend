import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});
