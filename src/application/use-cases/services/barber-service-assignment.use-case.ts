import { randomUUID } from "node:crypto";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { BarberServiceRepositoryPort } from "../../ports/barber-service-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";
import type { Requester } from "../../types/requester.js";
import type { ServiceView } from "./service-catalog.use-case.js";

export class AssignBarberToServiceUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly barberServices: BarberServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(serviceId: string, barberId: string): Promise<{ assignmentId: string }> {
    await assertBarberAndServiceExist(this.barbers, this.services, barberId, serviceId);
    const existing = await this.barberServices.findAssignment(barberId, serviceId, true);
    if (existing && !existing.deletedAt) {
      throw new DomainError("Barbeiro já está associado a este serviço", "ALREADY_ASSIGNED", 409);
    }
    const assignmentId = existing?.assignmentId ?? randomUUID();
    await this.barberServices.assign(barberId, serviceId, assignmentId, this.clock.now());
    return { assignmentId };
  }
}

export class UnassignBarberFromServiceUseCase {
  constructor(
    private readonly barberServices: BarberServiceRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(serviceId: string, barberId: string): Promise<void> {
    await assertBarberAndServiceExist(this.barbers, this.services, barberId, serviceId);
    const link = await this.barberServices.findAssignment(barberId, serviceId);
    if (!link) {
      throw new DomainError("Associação não encontrada", "NOT_FOUND", 404);
    }
    await this.barberServices.unassign(barberId, serviceId);
  }
}

export class RestoreBarberServiceAssignmentUseCase {
  constructor(
    private readonly barberServices: BarberServiceRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(serviceId: string, barberId: string): Promise<void> {
    await assertBarberAndServiceExist(this.barbers, this.services, barberId, serviceId);
    const link = await this.barberServices.findAssignment(barberId, serviceId, true);
    if (!link) {
      throw new DomainError("Associação não encontrada", "NOT_FOUND", 404);
    }
    if (!link.deletedAt) {
      throw new DomainError("Associação não está desactivada", "NOT_DELETED", 400);
    }
    await this.barberServices.restoreAssignment(barberId, serviceId);
  }
}

export class ListBarbersForServiceUseCase {
  constructor(
    private readonly barberServices: BarberServiceRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
    private readonly services: ServiceRepositoryPort,
  ) {}

  async execute(
    serviceId: string,
    includeDeletedLinks?: boolean,
  ): Promise<
    Array<{
      barberId: string;
      userId: string;
      name: string;
      linkDeletedAt: string | null;
    }>
  > {
    const service = await this.services.findById(serviceId, includeDeletedLinks === true);
    if (!service) {
      throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
    }
    const barberIds = await this.barberServices.listBarberIdsByService(
      serviceId,
      includeDeletedLinks === true,
    );
    const out: Array<{
      barberId: string;
      userId: string;
      name: string;
      linkDeletedAt: string | null;
    }> = [];
    for (const barberId of barberIds) {
      const barber = await this.barbers.findById(barberId, includeDeletedLinks === true);
      if (!barber) {
        continue;
      }
      const link = await this.barberServices.findAssignment(
        barberId,
        serviceId,
        includeDeletedLinks === true,
      );
      const u = await this.users.findById(barber.userId, includeDeletedLinks === true);
      if (!u) {
        continue;
      }
      out.push({
        barberId,
        userId: barber.userId,
        name: u.name,
        linkDeletedAt: link?.deletedAt ? link.deletedAt.toISOString() : null,
      });
    }
    return out;
  }
}

export class ListServicesForBarberUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly barberServices: BarberServiceRepositoryPort,
  ) {}

  async execute(barberId: string, includeDeletedLinks?: boolean): Promise<
    Array<{
      id: string;
      name: string;
      durationMinutes: number;
      priceCents: number;
      linkDeletedAt: string | null;
    }>
  > {
    const barber = await this.barbers.findById(barberId, includeDeletedLinks === true);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const rows = await this.barberServices.listServicesByBarberWithMeta(
      barberId,
      includeDeletedLinks === true,
    );
    return rows.map(({ service, linkDeletedAt }) => ({
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      linkDeletedAt: linkDeletedAt ? linkDeletedAt.toISOString() : null,
    }));
  }
}

export class ListMyAssignedServicesUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly barberServices: BarberServiceRepositoryPort,
  ) {}

  async execute(requester: Requester): Promise<ServiceView[]> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const rows = await this.barberServices.listServicesByBarber(barber.id);
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      deletedAt: null,
    }));
  }
}

async function assertBarberAndServiceExist(
  barbers: BarberRepositoryPort,
  services: ServiceRepositoryPort,
  barberId: string,
  serviceId: string,
): Promise<void> {
  const barber = await barbers.findById(barberId);
  if (!barber) {
    throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
  }
  const service = await services.findById(serviceId);
  if (!service) {
    throw new DomainError("Serviço não encontrado", "NOT_FOUND", 404);
  }
}
