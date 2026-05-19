import { randomUUID } from "node:crypto";
import { Barber } from "../../../domain/entities/barber.js";
import { User } from "../../../domain/entities/user.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { CreateBarberByAdminInput } from "../../dto/auth.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { PasswordHasherPort } from "../../ports/password-hasher.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class CreateBarberByAdminUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(input: CreateBarberByAdminInput): Promise<{ userId: string; barberId: string }> {
    const exists = await this.users.existsByEmail(input.email);
    if (exists) {
      throw new DomainError("E-mail já cadastrado", "EMAIL_IN_USE", 409);
    }
    const now = this.clock.now();
    const passwordHash = await this.hasher.hash(input.password);
    const userId = randomUUID();
    const barberId = randomUUID();
    const user = new User({
      id: userId,
      email: input.email.toLowerCase(),
      passwordHash,
      role: Role.BARBER,
      name: input.name,
      phoneE164: input.phoneE164 ?? null,
      createdAt: now,
      updatedAt: now,
    });
    const barber = new Barber({
      id: barberId,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    await this.users.save(user);
    await this.barbers.save(barber);
    return { userId, barberId };
  }
}
