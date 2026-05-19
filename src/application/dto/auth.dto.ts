import { z } from "zod";

export const registerClientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(120),
  phoneE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createBarberByAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(120),
  phoneE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .optional(),
});

export type CreateBarberByAdminInput = z.infer<typeof createBarberByAdminSchema>;
