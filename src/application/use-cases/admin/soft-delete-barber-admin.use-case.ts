import { DomainError } from "../../../domain/errors/domain-error.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class SoftDeleteBarberAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(barberId: string): Promise<void> {
    const barber = await this.barbers.findById(barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    await this.barbers.softDelete(barberId);
    await this.users.softDelete(barber.userId);
  }
}
