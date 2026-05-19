import type { Repository } from "typeorm";
import { User } from "../../../../domain/entities/user.js";
import type {
  ListUsersFilters,
  UserRepositoryPort,
  UserWithDeletionMeta,
} from "../../../../application/ports/user-repository.port.js";
import { userToDomain, userToOrm } from "../../mappers/user.mapper.js";
import type { UserOrm } from "../entities/user.orm.js";

export class TypeormUserRepository implements UserRepositoryPort {
  constructor(private readonly repo: Repository<UserOrm>) {}

  async save(user: User): Promise<void> {
    await this.repo.save(userToOrm(user));
  }

  async findByEmail(email: string, includeDeleted = false): Promise<User | null> {
    const row = await this.repo.findOne({
      where: { email },
      withDeleted: includeDeleted,
    });
    return row ? userToDomain(row) : null;
  }

  async findById(id: string, includeDeleted = false): Promise<User | null> {
    const row = await this.repo.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    return row ? userToDomain(row) : null;
  }

  async findByIdWithMeta(id: string, includeDeleted = false): Promise<UserWithDeletionMeta | null> {
    const row = await this.repo.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return { user: userToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repo.count({ where: { email } });
    return count > 0;
  }

  async listWithMeta(filters?: ListUsersFilters): Promise<UserWithDeletionMeta[]> {
    const rows = await this.repo.find({
      order: { createdAt: "DESC" },
      withDeleted: filters?.includeDeleted === true,
    });
    return rows.map((row) => ({
      user: userToDomain(row),
      deletedAt: row.deletedAt ?? null,
    }));
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore({ id });
  }
}
