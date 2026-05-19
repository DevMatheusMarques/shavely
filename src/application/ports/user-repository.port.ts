import type { User } from "../../domain/entities/user.js";

export interface ListUsersFilters {
  includeDeleted?: boolean;
}

export interface UserWithDeletionMeta {
  user: User;
  deletedAt: Date | null;
}

export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findByEmail(email: string, includeDeleted?: boolean): Promise<User | null>;
  findById(id: string, includeDeleted?: boolean): Promise<User | null>;
  findByIdWithMeta(id: string, includeDeleted?: boolean): Promise<UserWithDeletionMeta | null>;
  existsByEmail(email: string): Promise<boolean>;
  listWithMeta(filters?: ListUsersFilters): Promise<UserWithDeletionMeta[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
