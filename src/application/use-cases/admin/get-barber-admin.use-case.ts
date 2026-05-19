import { DomainError } from "../../../domain/errors/domain-error.js";
import type { AdminListQuery } from "../../dto/admin.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class GetBarberAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(
    barberId: string,
    query: AdminListQuery,
  ): Promise<{
    barberId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    user: { email: string; name: string; phoneE164: string | null };
  }> {
    const meta = await this.barbers.findByIdWithMeta(barberId, query.includeDeleted === true);
    if (!meta) {
      throw new DomainError("Barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const { barber, deletedAt } = meta;
    const u = await this.users.findById(barber.userId, query.includeDeleted === true);
    if (!u) {
      throw new DomainError("Utilizador do barbeiro não encontrado", "NOT_FOUND", 404);
    }
    const p = barber.toProps();
    return {
      barberId: barber.id,
      userId: barber.userId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
      user: { email: u.email, name: u.name, phoneE164: u.phoneE164 },
    };
  }
}
