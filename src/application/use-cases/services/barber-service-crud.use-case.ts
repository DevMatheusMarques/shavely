import { Service } from "../../../domain/entities/service.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { UpdateServiceInput } from "../../dto/service.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class ListMyServicesUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(
    requester: Requester,
    includeDeleted?: boolean,
  ): Promise<
    Array<{
      id: string;
      barberId: string;
      name: string;
      durationMinutes: number;
      priceCents: number;
      deletedAt: string | null;
    }>
  > {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros podem listar serviços próprios", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const rows = await this.services.listByBarberWithMeta(barber.id, includeDeleted === true);
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

export class GetServiceByBarberUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(
    requester: Requester,
    serviceId: string,
    includeDeleted?: boolean,
  ): Promise<{
    id: string;
    barberId: string;
    name: string;
    durationMinutes: number;
    priceCents: number;
    deletedAt: string | null;
  }> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const row = await this.services.findByIdAndBarberWithMeta(serviceId, barber.id, includeDeleted === true);
    if (!row) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    const { service, deletedAt } = row;
    return {
      id: service.id,
      barberId: service.barberId,
      name: service.name,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    };
  }
}

export class UpdateServiceUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(requester: Requester, serviceId: string, input: UpdateServiceInput): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    if (input.name === undefined && input.durationMinutes === undefined && input.priceCents === undefined) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const existing = await this.services.findByIdAndBarber(serviceId, barber.id);
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

export class SoftDeleteServiceUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(requester: Requester, serviceId: string): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const existing = await this.services.findByIdAndBarber(serviceId, barber.id);
    if (!existing) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    await this.services.softDelete(serviceId);
  }
}

export class RestoreServiceUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(requester: Requester, serviceId: string): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const row = await this.services.findByIdAndBarberWithMeta(serviceId, barber.id, true);
    if (!row) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    if (!row.deletedAt) {
      throw new DomainError("Serviço não está apagado", "NOT_DELETED", 400);
    }
    await this.services.restore(serviceId);
  }
}
