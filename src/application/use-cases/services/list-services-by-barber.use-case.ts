import type { Service } from "../../../domain/entities/service.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";

export class ListServicesByBarberUseCase {
  constructor(private readonly services: ServiceRepositoryPort) {}

  execute(barberId: string): Promise<Service[]> {
    return this.services.listByBarber(barberId);
  }
}
