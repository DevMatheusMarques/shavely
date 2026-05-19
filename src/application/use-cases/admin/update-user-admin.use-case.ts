import { User } from "../../../domain/entities/user.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import type { UpdateUserByAdminInput } from "../../dto/admin.dto.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";

export class UpdateUserAdminUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(userId: string, input: UpdateUserByAdminInput): Promise<void> {
    if (input.name === undefined && input.phoneE164 === undefined && input.role === undefined) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new DomainError("Utilizador não encontrado", "NOT_FOUND", 404);
    }
    const p = existing.toProps();
    const now = this.clock.now();
    const updated = new User({
      ...p,
      name: input.name ?? p.name,
      phoneE164: input.phoneE164 !== undefined ? input.phoneE164 : p.phoneE164,
      role: input.role ?? p.role,
      updatedAt: now,
    });
    await this.users.save(updated);
  }
}
