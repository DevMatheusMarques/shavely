import { DomainError } from "../../../domain/errors/domain-error.js";
import type { LoginInput } from "../../dto/auth.dto.js";
import type { PasswordHasherPort } from "../../ports/password-hasher.port.js";
import type { TokenServicePort } from "../../ports/token-service.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class LoginUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly tokens: TokenServicePort,
  ) {}

  async execute(input: LoginInput): Promise<{ accessToken: string }> {
    const user = await this.users.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new DomainError("Credenciais inválidas", "INVALID_CREDENTIALS", 401);
    }
    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new DomainError("Credenciais inválidas", "INVALID_CREDENTIALS", 401);
    }
    const accessToken = await this.tokens.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    return { accessToken };
  }
}
