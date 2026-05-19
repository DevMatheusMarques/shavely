import type { Repository } from "typeorm";
import type {
  AvailabilitySlotWithMeta,
  BarberRepositoryPort,
  BarberWithDeletionMeta,
  ListBarbersFilters,
} from "../../../../application/ports/barber-repository.port.js";
import { Barber } from "../../../../domain/entities/barber.js";
import type { BarberAvailability } from "../../../../domain/entities/barber-availability.js";
import {
  availabilityToDomain,
  availabilityToOrm,
  barberToDomain,
  barberToOrm,
} from "../../mappers/barber.mapper.js";
import { BarberAvailabilityOrm } from "../entities/barber-availability.orm.js";
import type { BarberOrm } from "../entities/barber.orm.js";

export class TypeormBarberRepository implements BarberRepositoryPort {
  constructor(
    private readonly barbers: Repository<BarberOrm>,
    private readonly availability: Repository<BarberAvailabilityOrm>,
  ) {}

  async save(barber: Barber): Promise<void> {
    await this.barbers.save(barberToOrm(barber));
  }

  async findById(id: string, includeDeleted = false): Promise<Barber | null> {
    const row = await this.barbers.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    return row ? barberToDomain(row) : null;
  }

  async findByIdWithMeta(id: string, includeDeleted = false): Promise<BarberWithDeletionMeta | null> {
    const row = await this.barbers.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return { barber: barberToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async findByUserId(userId: string, includeDeleted = false): Promise<Barber | null> {
    const row = await this.barbers.findOne({
      where: { userId },
      withDeleted: includeDeleted,
    });
    return row ? barberToDomain(row) : null;
  }

  async listWithMeta(filters?: ListBarbersFilters): Promise<BarberWithDeletionMeta[]> {
    const rows = await this.barbers.find({
      order: { createdAt: "DESC" },
      withDeleted: filters?.includeDeleted === true,
    });
    return rows.map((row) => ({
      barber: barberToDomain(row),
      deletedAt: row.deletedAt ?? null,
    }));
  }

  async softDelete(id: string): Promise<void> {
    await this.barbers.softDelete({ id });
  }

  async restore(id: string): Promise<void> {
    await this.barbers.restore({ id });
  }

  async listAvailability(barberId: string, includeDeleted = false): Promise<BarberAvailability[]> {
    const rows = await this.availability.find({
      where: { barberId },
      order: { weekday: "ASC", startMinutes: "ASC" },
      withDeleted: includeDeleted,
    });
    return rows.map(availabilityToDomain);
  }

  async listAvailabilityWithMeta(barberId: string, includeDeleted = false): Promise<AvailabilitySlotWithMeta[]> {
    const rows = await this.availability.find({
      where: { barberId },
      order: { weekday: "ASC", startMinutes: "ASC" },
      withDeleted: includeDeleted,
    });
    return rows.map((row) => ({
      slot: availabilityToDomain(row),
      deletedAt: row.deletedAt ?? null,
    }));
  }

  async findAvailabilityById(id: string, includeDeleted = false): Promise<BarberAvailability | null> {
    const row = await this.availability.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    return row ? availabilityToDomain(row) : null;
  }

  async findAvailabilityByIdWithMeta(
    id: string,
    includeDeleted = false,
  ): Promise<AvailabilitySlotWithMeta | null> {
    const row = await this.availability.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return { slot: availabilityToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async saveAvailability(rows: BarberAvailability[]): Promise<void> {
    if (rows.length === 0) {
      return;
    }
    const barberId = rows[0]!.barberId;
    await this.availability.softDelete({ barberId });
    const orms = rows.map((r) => availabilityToOrm(r));
    await this.availability.insert(orms);
  }

  async insertAvailabilitySlot(row: BarberAvailability): Promise<void> {
    await this.availability.insert(availabilityToOrm(row));
  }

  async updateAvailabilitySlot(row: BarberAvailability): Promise<void> {
    await this.availability.save(availabilityToOrm(row));
  }

  async softDeleteAvailabilitySlot(id: string, barberId: string): Promise<void> {
    await this.availability.softDelete({ id, barberId });
  }

  async restoreAvailabilitySlot(id: string): Promise<void> {
    await this.availability.restore({ id });
  }
}
