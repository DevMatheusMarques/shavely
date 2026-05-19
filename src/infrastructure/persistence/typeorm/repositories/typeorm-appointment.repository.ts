import type { Repository } from "typeorm";
import type {
  AppointmentListFilters,
  AppointmentRepositoryPort,
  AppointmentWithDeletionMeta,
} from "../../../../application/ports/appointment-repository.port.js";
import { Appointment } from "../../../../domain/entities/appointment.js";
import { AppointmentStatus } from "../../../../domain/value-objects/appointment-status.js";
import { appointmentToDomain, appointmentToOrm } from "../../mappers/appointment.mapper.js";
import type { AppointmentOrm } from "../entities/appointment.orm.js";

export class TypeormAppointmentRepository implements AppointmentRepositoryPort {
  constructor(private readonly repo: Repository<AppointmentOrm>) {}

  async save(appointment: Appointment): Promise<void> {
    const row = appointmentToOrm(appointment);
    const existing = await this.repo.findOne({ where: { id: row.id } });
    row.reminderSentAt = existing?.reminderSentAt ?? null;
    await this.repo.save(row);
  }

  async findById(id: string, includeDeleted = false): Promise<Appointment | null> {
    const row = await this.repo.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    return row ? appointmentToDomain(row) : null;
  }

  async findByIdWithMeta(id: string, includeDeleted = false): Promise<AppointmentWithDeletionMeta | null> {
    const row = await this.repo.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return { appointment: appointmentToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async hasOverlap(barberId: string, startsAt: Date, endsAt: Date, excludeId?: string): Promise<boolean> {
    const qb = this.repo
      .createQueryBuilder("a")
      .where("a.barberId = :barberId", { barberId })
      .andWhere("a.deletedAt IS NULL")
      .andWhere("a.status = :status", { status: AppointmentStatus.SCHEDULED })
      .andWhere("a.startsAt < :endsAt AND a.endsAt > :startsAt", { startsAt, endsAt });
    if (excludeId) {
      qb.andWhere("a.id <> :excludeId", { excludeId });
    }
    const count = await qb.getCount();
    return count > 0;
  }

  async list(filters: AppointmentListFilters): Promise<Appointment[]> {
    const qb = this.repo.createQueryBuilder("a").orderBy("a.startsAt", "ASC");
    if (!filters.includeDeleted) {
      qb.andWhere("a.deletedAt IS NULL");
    }
    if (filters.barberId) {
      qb.andWhere("a.barberId = :barberId", { barberId: filters.barberId });
    }
    if (filters.clientId) {
      qb.andWhere("a.clientId = :clientId", { clientId: filters.clientId });
    }
    if (filters.from) {
      qb.andWhere("a.startsAt >= :from", { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere("a.startsAt <= :to", { to: filters.to });
    }
    const rows = await qb.getMany();
    return rows.map(appointmentToDomain);
  }

  async findUpcomingForReminder(windowStart: Date, windowEnd: Date): Promise<Appointment[]> {
    const rows = await this.repo
      .createQueryBuilder("a")
      .where("a.deletedAt IS NULL")
      .andWhere("a.status = :status", { status: AppointmentStatus.SCHEDULED })
      .andWhere("a.startsAt >= :ws", { ws: windowStart })
      .andWhere("a.startsAt <= :we", { we: windowEnd })
      .andWhere("a.reminderSentAt IS NULL")
      .getMany();
    return rows.map(appointmentToDomain);
  }

  async markReminderSent(appointmentId: string, at: Date): Promise<void> {
    await this.repo.update({ id: appointmentId }, { reminderSentAt: at });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore({ id });
  }
}
