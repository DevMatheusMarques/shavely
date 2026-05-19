import type { Role } from "../domain/value-objects/role.js";

declare module "fastify" {
  interface FastifyRequest {
    requester?: {
      userId: string;
      role: Role;
    };
  }
}
