import { User } from "../../../domain/entities/user.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import type { UpdateBarberLinkedUserInput } from "../../dto/admin.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";

export class UpdateBarberAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(barberId: string, input: UpdateBarberLinkedUserInput): Promise<void> {
    if (input.name === undefined && input.phoneE164 === undefined) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const barber = await this.barbers.findById(barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const existing = await this.users.findById(barber.userId);
    if (!existing) {
      throw new DomainError("Utilizador não encontrado", "NOT_FOUND", 404);
    }
    const p = existing.toProps();
    const now = this.clock.now();
    const updated = new User({
      ...p,
      name: input.name ?? p.name,
      phoneE164: input.phoneE164 !== undefined ? input.phoneE164 : p.phoneE164,
      updatedAt: now,
    });
    await this.users.save(updated);
  }
}
