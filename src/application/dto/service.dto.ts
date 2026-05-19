import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2).max(120),
  durationMinutes: z.number().int().min(15).max(480),
  priceCents: z.number().int().min(0),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  priceCents: z.number().int().min(0).optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export const availabilitySlotSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinutes: z.number().int().min(0).max(24 * 60 - 1),
  endMinutes: z.number().int().min(1).max(24 * 60),
});

export const setAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema).min(1),
});

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;

export const createAvailabilitySlotSchema = availabilitySlotSchema;

export type CreateAvailabilitySlotInput = z.infer<typeof createAvailabilitySlotSchema>;

export const updateAvailabilitySlotSchema = availabilitySlotSchema.partial();

export type UpdateAvailabilitySlotInput = z.infer<typeof updateAvailabilitySlotSchema>;
