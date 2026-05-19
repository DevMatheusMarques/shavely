import { z } from "zod";

export const createAppointmentSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  serviceId: z.string().uuid().optional(),
  startsAt: z.string().datetime().optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

export const listAppointmentsQuerySchema = z.object({
  barberId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  /** Apenas ADMIN: incluir agendamentos com soft delete. */
  includeDeleted: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(["ios", "android", "web"]),
});

export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
