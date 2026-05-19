import { DomainError } from "../../../domain/errors/domain-error.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class RestoreBarberAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(barberId: string): Promise<void> {
    const meta = await this.barbers.findByIdWithMeta(barberId, true);
    if (!meta) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    if (!meta.deletedAt) {
      throw new DomainError("Barbeiro não está apagado", "NOT_DELETED", 400);
    }
    await this.barbers.restore(barberId);
    await this.users.restore(meta.barber.userId);
  }
}
