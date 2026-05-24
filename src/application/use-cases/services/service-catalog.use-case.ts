import { randomUUID } from "node:crypto";
import { Service } from "../../../domain/entities/service.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import type { CreateServiceInput, UpdateServiceInput } from "../../dto/service.dto.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";

export interface ServiceView {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

function toView(service: Service, deletedAt: Date | null): ServiceView {
  return {
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
    deletedAt: deletedAt ? deletedAt.toISOString() : null,
  };
}

export class CreateServiceCatalogUseCase {
  constructor(
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(input: CreateServiceInput): Promise<{ serviceId: string }> {
    const now = this.clock.now();
    const service = new Service({
      id: randomUUID(),
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

export class ListServicesCatalogUseCase {
  constructor(private readonly services: ServiceRepositoryPort) {}

  async execute(includeDeleted?: boolean): Promise<ServiceView[]> {
    const rows = await this.services.listWithMeta({ includeDeleted: includeDeleted === true });
    return rows.map(({ service, deletedAt }) => toView(service, deletedAt));
  }
}

export class GetServiceCatalogUseCase {
  constructor(private readonly services: ServiceRepositoryPort) {}

  async execute(serviceId: string, includeDeleted?: boolean): Promise<ServiceView> {
    const meta = await this.services.findByIdWithMeta(serviceId, includeDeleted === true);
    if (!meta) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    return toView(meta.service, meta.deletedAt);
  }
}

export class UpdateServiceCatalogUseCase {
  constructor(
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(serviceId: string, input: UpdateServiceInput): Promise<void> {
    if (input.name === undefined && input.durationMinutes === undefined && input.priceCents === undefined) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const existing = await this.services.findById(serviceId);
    if (!existing) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    const p = existing.toProps();
    const updated = new Service({
      ...p,
      name: input.name ?? p.name,
      durationMinutes: input.durationMinutes ?? p.durationMinutes,
      priceCents: input.priceCents ?? p.priceCents,
      updatedAt: this.clock.now(),
    });
    await this.services.save(updated);
  }
}

export class SoftDeleteServiceCatalogUseCase {
  constructor(private readonly services: ServiceRepositoryPort) {}

  async execute(serviceId: string): Promise<void> {
    const existing = await this.services.findById(serviceId);
    if (!existing) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    await this.services.softDelete(serviceId);
  }
}

export class RestoreServiceCatalogUseCase {
  constructor(private readonly services: ServiceRepositoryPort) {}

  async execute(serviceId: string): Promise<void> {
    const meta = await this.services.findByIdWithMeta(serviceId, true);
    if (!meta) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    if (!meta.deletedAt) {
      throw new DomainError("Serviço não está apagado", "NOT_DELETED", 400);
    }
    await this.services.restore(serviceId);
  }
}
