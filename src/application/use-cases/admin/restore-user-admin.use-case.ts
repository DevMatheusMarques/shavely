import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class RestoreUserAdminUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const meta = await this.users.findByIdWithMeta(userId, true);
    if (!meta) {
      throw new DomainError("Utilizador não encontrado", "NOT_FOUND", 404);
    }
    if (!meta.deletedAt) {
      throw new DomainError("Utilizador não está apagado", "NOT_DELETED", 400);
    }
    await this.users.restore(userId);
    if (meta.user.role === Role.BARBER) {
      const barber = await this.barbers.findByUserId(userId, true);
      if (barber) {
        const barberMeta = await this.barbers.findByIdWithMeta(barber.id, true);
        if (barberMeta?.deletedAt) {
          await this.barbers.restore(barber.id);
        }
      }
    }
  }
}
