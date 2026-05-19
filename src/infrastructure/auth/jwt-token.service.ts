import jwt, { type SignOptions } from "jsonwebtoken";
import type {
  AuthTokenPayload,
  TokenServicePort,
} from "../../application/ports/token-service.port.js";
import type { AppEnv } from "../../config/env.js";

export class JwtTokenService implements TokenServicePort {
  constructor(private readonly env: AppEnv) {}

  async sign(payload: AuthTokenPayload): Promise<string> {
    const options = { expiresIn: this.env.JWT_EXPIRES_IN } as SignOptions;
    return jwt.sign({ sub: payload.sub, role: payload.role, email: payload.email }, this.env.JWT_SECRET, options);
  }

  async verify(token: string): Promise<AuthTokenPayload> {
    const decoded = jwt.verify(token, this.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object") {
      throw new Error("Invalid token");
    }
    const d = decoded as { sub?: string; role?: string; email?: string };
    if (!d.sub || !d.role || !d.email) {
      throw new Error("Invalid token payload");
    }
    return { sub: d.sub, role: d.role, email: d.email };
  }
}
