import { randomUUID } from "node:crypto";
import { Service } from "../../../domain/entities/service.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { CreateServiceInput } from "../../dto/service.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class CreateServiceUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(requester: Requester, input: CreateServiceInput): Promise<{ serviceId: string }> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros podem criar serviços", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const now = this.clock.now();
    const service = new Service({
      id: randomUUID(),
      barberId: barber.id,
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
