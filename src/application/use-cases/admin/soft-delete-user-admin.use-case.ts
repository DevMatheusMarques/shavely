import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class SoftDeleteUserAdminUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainError("Utilizador não encontrado", "NOT_FOUND", 404);
    }
    if (user.role === Role.BARBER) {
      const barber = await this.barbers.findByUserId(userId);
      if (barber) {
        await this.barbers.softDelete(barber.id);
      }
    }
    await this.users.softDelete(userId);
  }
}
