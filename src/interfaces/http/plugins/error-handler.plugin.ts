import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/errors/domain-error.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function registerErrorHandler(app: FastifyInstance): Promise<void> {
  app.setErrorHandler((err: unknown, request, reply) => {
    request.log.error({ err }, "request failed");
    if (err instanceof DomainError) {
      void reply.status(err.statusCode).send({ code: err.code, message: err.message });
      return;
    }
    if (err instanceof ZodError) {
      void reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "Payload inválido",
        details: err.flatten(),
      });
      return;
    }
    if (isRecord(err) && typeof err.statusCode === "number" && typeof err.message === "string") {
      void reply.status(err.statusCode).send({ message: err.message });
      return;
    }
    void reply.status(500).send({ code: "INTERNAL", message: "Erro interno" });
  });
}
