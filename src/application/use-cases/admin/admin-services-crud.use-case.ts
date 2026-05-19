import { randomUUID } from "node:crypto";
import { Service } from "../../../domain/entities/service.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import type { CreateServiceInput, UpdateServiceInput } from "../../dto/service.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";

interface ServiceRow {
  id: string;
  barberId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  deletedAt: string | null;
}

export class ListServicesByBarberAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(barberId: string, includeDeleted?: boolean): Promise<ServiceRow[]> {
    const barber = await this.barbers.findById(barberId, includeDeleted === true);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const rows = await this.services.listByBarberWithMeta(barberId, includeDeleted === true);
    return rows.map(({ service, deletedAt }) => ({
      id: service.id,
      barberId: service.barberId,
      name: service.name,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    }));
  }
}

export class CreateServiceAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(barberId: string, input: CreateServiceInput): Promise<{ serviceId: string }> {
    const barber = await this.barbers.findById(barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const now = this.clock.now();
    const service = new Service({
      id: randomUUID(),
      barberId,
      name: input.name,
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      createdAt: now,
      updatedAt: now,
    });
    await this.services.save(service);
    return { serviceId: service.id };
  }
}

export class UpdateServiceAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(barberId: string, serviceId: string, input: UpdateServiceInput): Promise<void> {
    if (input.name === undefined && input.durationMinutes === undefined && input.priceCents === undefined) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const barber = await this.barbers.findById(barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const existing = await this.services.findByIdAndBarber(serviceId, barberId);
    if (!existing) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    const p = existing.toProps();
    const now = this.clock.now();
    const updated = new Service({
      ...p,
      name: input.name ?? p.name,
      durationMinutes: input.durationMinutes ?? p.durationMinutes,
      priceCents: input.priceCents ?? p.priceCents,
      updatedAt: now,
    });
    await this.services.save(updated);
  }
}

export class SoftDeleteServiceAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(barberId: string, serviceId: string): Promise<void> {
    const barber = await this.barbers.findById(barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const existing = await this.services.findByIdAndBarber(serviceId, barberId);
    if (!existing) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    await this.services.softDelete(serviceId);
  }
}

export class RestoreServiceAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(barberId: string, serviceId: string): Promise<void> {
    const barber = await this.barbers.findById(barberId, true);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const row = await this.services.findByIdAndBarberWithMeta(serviceId, barberId, true);
    if (!row) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    if (!row.deletedAt) {
      throw new DomainError("Serviço não está apagado", "NOT_DELETED", 400);
    }
    await this.services.restore(serviceId);
  }
}
