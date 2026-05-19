import type { Barber } from "../../domain/entities/barber.js";
import type { BarberAvailability } from "../../domain/entities/barber-availability.js";

export interface ListBarbersFilters {
  includeDeleted?: boolean;
}

export interface BarberWithDeletionMeta {
  barber: Barber;
  deletedAt: Date | null;
}

export interface AvailabilitySlotWithMeta {
  slot: BarberAvailability;
  deletedAt: Date | null;
}

export interface BarberRepositoryPort {
  save(barber: Barber): Promise<void>;
  findById(id: string, includeDeleted?: boolean): Promise<Barber | null>;
  findByIdWithMeta(id: string, includeDeleted?: boolean): Promise<BarberWithDeletionMeta | null>;
  findByUserId(userId: string, includeDeleted?: boolean): Promise<Barber | null>;
  listWithMeta(filters?: ListBarbersFilters): Promise<BarberWithDeletionMeta[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  listAvailability(barberId: string, includeDeleted?: boolean): Promise<BarberAvailability[]>;
  listAvailabilityWithMeta(barberId: string, includeDeleted?: boolean): Promise<AvailabilitySlotWithMeta[]>;
  findAvailabilityById(id: string, includeDeleted?: boolean): Promise<BarberAvailability | null>;
  findAvailabilityByIdWithMeta(id: string, includeDeleted?: boolean): Promise<AvailabilitySlotWithMeta | null>;
  /** Substitui todos os intervalos ativos por novos (soft delete dos anteriores). */
  saveAvailability(rows: BarberAvailability[]): Promise<void>;
  insertAvailabilitySlot(row: BarberAvailability): Promise<void>;
  updateAvailabilitySlot(row: BarberAvailability): Promise<void>;
  softDeleteAvailabilitySlot(id: string, barberId: string): Promise<void>;
  restoreAvailabilitySlot(id: string): Promise<void>;
}
