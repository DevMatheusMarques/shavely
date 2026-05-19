import { DomainError } from "../../../domain/errors/domain-error.js";
import type { AdminListQuery } from "../../dto/admin.dto.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class GetUserAdminUseCase {
  constructor(private readonly users: UserRepositoryPort) {}

  async execute(
    userId: string,
    query: AdminListQuery,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    name: string;
    phoneE164: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }> {
    const row = await this.users.findByIdWithMeta(userId, query.includeDeleted === true);
    if (!row) {
      throw new DomainError("Utilizador não encontrado", "NOT_FOUND", 404);
    }
    const { user, deletedAt } = row;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phoneE164: user.phoneE164,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    };
  }
}
