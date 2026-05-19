import { User } from "../../../domain/entities/user.js";
import { Role } from "../../../domain/value-objects/role.js";
import { UserOrm } from "../typeorm/entities/user.orm.js";

export function userToDomain(row: UserOrm): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as Role,
    name: row.name,
    phoneE164: row.phoneE164,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function userToOrm(user: User): UserOrm {
  const p = user.toProps();
  const row = new UserOrm();
  row.id = p.id;
  row.email = p.email;
  row.passwordHash = p.passwordHash;
  row.role = p.role;
  row.name = p.name;
  row.phoneE164 = p.phoneE164;
  row.createdAt = p.createdAt;
  row.updatedAt = p.updatedAt;
  return row;
}
