import type { FastifyReply, FastifyRequest } from "fastify";
import { parseRole } from "../../../domain/value-objects/role.js";
import type { TokenServicePort } from "../../../application/ports/token-service.port.js";

export function createAuthenticate(tokenService: TokenServicePort) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      void reply.status(401).send({ code: "UNAUTHORIZED", message: "Token ausente" });
      return;
    }
    const raw = header.slice("Bearer ".length).trim();
    try {
      const payload = await tokenService.verify(raw);
      request.requester = { userId: payload.sub, role: parseRole(payload.role) };
    } catch {
      void reply.status(401).send({ code: "UNAUTHORIZED", message: "Token inválido" });
    }
  };
}

export function createRequireRoles(...roles: string[]) {
  return async function requireRoles(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const r = request.requester;
    if (!r) {
      void reply.status(401).send({ code: "UNAUTHORIZED", message: "Não autenticado" });
      return;
    }
    if (!roles.includes(r.role)) {
      void reply.status(403).send({ code: "FORBIDDEN", message: "Sem permissão" });
      return;
    }
  };
}
