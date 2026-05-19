import { randomUUID } from "node:crypto";
import { User } from "../../../domain/entities/user.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { RegisterClientInput } from "../../dto/auth.dto.js";
import type { PasswordHasherPort } from "../../ports/password-hasher.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";

export class RegisterClientUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(input: RegisterClientInput): Promise<{ userId: string }> {
    const exists = await this.users.existsByEmail(input.email);
    if (exists) {
      throw new DomainError("E-mail já cadastrado", "EMAIL_IN_USE", 409);
    }
    const now = this.clock.now();
    const passwordHash = await this.hasher.hash(input.password);
    const user = new User({
      id: randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: Role.CLIENT,
      name: input.name,
      phoneE164: input.phoneE164 ?? null,
      createdAt: now,
      updatedAt: now,
    });
    await this.users.save(user);
    return { userId: user.id };
  }
}
