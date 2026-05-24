import { DomainError } from "../../../domain/errors/domain-error.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { BarberServiceRepositoryPort } from "../../ports/barber-service-repository.port.js";
import type { Service } from "../../../domain/entities/service.js";

/** Serviços do catálogo associados a um barbeiro (público / marcação). */
export class ListServicesByBarberUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly barberServices: BarberServiceRepositoryPort,
  ) {}

  async execute(barberId: string): Promise<Service[]> {
    const barber = await this.barbers.findById(barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    return this.barberServices.listServicesByBarber(barberId);
  }
}
