import { z } from "zod";
import { Role } from "../../domain/value-objects/role.js";

export const createClientByAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(120),
  phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/).optional(),
});

export type CreateClientByAdminInput = z.infer<typeof createClientByAdminSchema>;

export const updateUserByAdminSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/).nullable().optional(),
  role: z.nativeEnum(Role).optional(),
});

export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;

export const updateBarberLinkedUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/).nullable().optional(),
});

export type UpdateBarberLinkedUserInput = z.infer<typeof updateBarberLinkedUserSchema>;

export const adminListQuerySchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
