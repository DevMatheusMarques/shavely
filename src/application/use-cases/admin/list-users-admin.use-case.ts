import type { AdminListQuery } from "../../dto/admin.dto.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class ListUsersAdminUseCase {
  constructor(private readonly users: UserRepositoryPort) {}

  async execute(query: AdminListQuery): Promise<
    Array<{
      id: string;
      email: string;
      role: string;
      name: string;
      phoneE164: string | null;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    }>
  > {
    const rows = await this.users.listWithMeta({ includeDeleted: query.includeDeleted });
    return rows.map(({ user, deletedAt }) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phoneE164: user.phoneE164,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    }));
  }
}
