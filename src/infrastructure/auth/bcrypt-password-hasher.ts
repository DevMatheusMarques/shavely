import bcrypt from "bcryptjs";
import type { PasswordHasherPort } from "../../application/ports/password-hasher.port.js";

const ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
