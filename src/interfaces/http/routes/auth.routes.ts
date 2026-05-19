import type { FastifyInstance } from "fastify";
import { loginSchema, registerClientSchema } from "../../../application/dto/auth.dto.js";
import type { LoginUseCase } from "../../../application/use-cases/auth/login.use-case.js";
import type { RegisterClientUseCase } from "../../../application/use-cases/auth/register-client.use-case.js";
import {
  errorSchema,
  loginBodySchema,
  loginResponseSchema,
  registerBodySchema,
  registerResponseSchema,
  validationErrorSchema,
} from "../openapi/schemas.js";

export function registerAuthRoutes(
  app: FastifyInstance,
  deps: { registerClient: RegisterClientUseCase; login: LoginUseCase },
): void {
  app.post(
    "/auth/register",
    {
      schema: {
        tags: ["auth"],
        summary: "Registar cliente",
        description:
          "Cria utilizador com papel CLIENT. Opcionalmente associa telefone E.164 para integrações futuras.",
        body: registerBodySchema,
        response: {
          201: {
            description: "Utilizador criado",
            ...registerResponseSchema,
          },
          400: {
            ...validationErrorSchema,
            description: "Payload inválido",
          },
          409: {
            ...errorSchema,
            description: "E-mail já registado",
          },
        },
      },
    },
    async (request, reply) => {
      const body = registerClientSchema.parse(request.body);
      const result = await deps.registerClient.execute(body);
      void reply.status(201).send(result);
    },
  );

  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Login",
        description: "Autenticação por e-mail e palavra-passe. Devolve JWT para Authorization Bearer.",
        body: loginBodySchema,
        response: {
          200: {
            description: "Token emitido",
            ...loginResponseSchema,
          },
          400: {
            ...validationErrorSchema,
            description: "Payload inválido",
          },
          401: {
            ...errorSchema,
            description: "Credenciais inválidas",
          },
        },
      },
    },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);
      const result = await deps.login.execute(body);
      void reply.send(result);
    },
  );
}
