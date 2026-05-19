import type { Appointment } from "../../domain/entities/appointment.js";

export interface AppointmentWithDeletionMeta {
  appointment: Appointment;
  deletedAt: Date | null;
}

export interface AppointmentListFilters {
  barberId?: string;
  clientId?: string;
  from?: Date;
  to?: Date;
  /** Apenas para cenários administrativos (ex.: lixo). */
  includeDeleted?: boolean;
}

export interface AppointmentRepositoryPort {
  save(appointment: Appointment): Promise<void>;
  findById(id: string, includeDeleted?: boolean): Promise<Appointment | null>;
  findByIdWithMeta(id: string, includeDeleted?: boolean): Promise<AppointmentWithDeletionMeta | null>;
  hasOverlap(barberId: string, startsAt: Date, endsAt: Date, excludeId?: string): Promise<boolean>;
  list(filters: AppointmentListFilters): Promise<Appointment[]>;
  findUpcomingForReminder(windowStart: Date, windowEnd: Date): Promise<Appointment[]>;
  markReminderSent(appointmentId: string, at: Date): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
