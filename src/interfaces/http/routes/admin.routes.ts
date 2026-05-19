import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { createBarberByAdminSchema } from "../../../application/dto/auth.dto.js";
import {
  adminListQuerySchema,
  createClientByAdminSchema,
  updateBarberLinkedUserSchema,
  updateUserByAdminSchema,
} from "../../../application/dto/admin.dto.js";
import { createServiceSchema, updateServiceSchema } from "../../../application/dto/service.dto.js";
import type {
  CreateServiceAdminUseCase,
  ListServicesByBarberAdminUseCase,
  RestoreServiceAdminUseCase,
  SoftDeleteServiceAdminUseCase,
  UpdateServiceAdminUseCase,
} from "../../../application/use-cases/admin/admin-services-crud.use-case.js";
import type { CreateBarberByAdminUseCase } from "../../../application/use-cases/admin/create-barber-by-admin.use-case.js";
import type { CreateClientByAdminUseCase } from "../../../application/use-cases/admin/create-client-by-admin.use-case.js";
import type { GetBarberAdminUseCase } from "../../../application/use-cases/admin/get-barber-admin.use-case.js";
import type { GetUserAdminUseCase } from "../../../application/use-cases/admin/get-user-admin.use-case.js";
import type { ListBarbersAdminUseCase } from "../../../application/use-cases/admin/list-barbers-admin.use-case.js";
import type { ListUsersAdminUseCase } from "../../../application/use-cases/admin/list-users-admin.use-case.js";
import type { RestoreBarberAdminUseCase } from "../../../application/use-cases/admin/restore-barber-admin.use-case.js";
import type { RestoreUserAdminUseCase } from "../../../application/use-cases/admin/restore-user-admin.use-case.js";
import type { SoftDeleteBarberAdminUseCase } from "../../../application/use-cases/admin/soft-delete-barber-admin.use-case.js";
import type { SoftDeleteUserAdminUseCase } from "../../../application/use-cases/admin/soft-delete-user-admin.use-case.js";
import type { UpdateBarberAdminUseCase } from "../../../application/use-cases/admin/update-barber-admin.use-case.js";
import type { UpdateUserAdminUseCase } from "../../../application/use-cases/admin/update-user-admin.use-case.js";
import {
  createBarberAdminBodySchema,
  createBarberAdminResponseSchema,
  createClientAdminBodySchema,
  createServiceBodySchema,
  createServiceResponseSchema,
  errorSchema,
  includeDeletedQuerySchema,
  updateBarberAdminBodySchema,
  updateServiceBodySchema,
  updateUserAdminBodySchema,
  validationErrorSchema,
} from "../openapi/schemas.js";

export function registerAdminRoutes(
  app: FastifyInstance,
  deps: {
    createBarberByAdmin: CreateBarberByAdminUseCase;
    createClientByAdmin: CreateClientByAdminUseCase;
    listUsersAdmin: ListUsersAdminUseCase;
    getUserAdmin: GetUserAdminUseCase;
    updateUserAdmin: UpdateUserAdminUseCase;
    softDeleteUserAdmin: SoftDeleteUserAdminUseCase;
    restoreUserAdmin: RestoreUserAdminUseCase;
    listBarbersAdmin: ListBarbersAdminUseCase;
    getBarberAdmin: GetBarberAdminUseCase;
    updateBarberAdmin: UpdateBarberAdminUseCase;
    softDeleteBarberAdmin: SoftDeleteBarberAdminUseCase;
    restoreBarberAdmin: RestoreBarberAdminUseCase;
    listServicesByBarberAdmin: ListServicesByBarberAdminUseCase;
    createServiceAdmin: CreateServiceAdminUseCase;
    updateServiceAdmin: UpdateServiceAdminUseCase;
    softDeleteServiceAdmin: SoftDeleteServiceAdminUseCase;
    restoreServiceAdmin: RestoreServiceAdminUseCase;
  },
  authenticate: preHandlerHookHandler,
  requireAdmin: preHandlerHookHandler,
): void {
  const adminPre = [authenticate, requireAdmin];

  app.post(
    "/admin/barbers",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Criar barbeiro (admin)",
        description:
          "Apenas ADMIN. Cria utilizador BARBER e registo na tabela barbers. Opcional: telefone para links WhatsApp.",
        security: [{ bearerAuth: [] }],
        body: createBarberAdminBodySchema,
        response: {
          201: {
            description: "Barbeiro criado",
            ...createBarberAdminResponseSchema,
          },
          400: {
            ...validationErrorSchema,
            description: "Validação",
          },
          401: {
            ...errorSchema,
            description: "Token ausente ou inválido",
          },
          403: {
            ...errorSchema,
            description: "Não é ADMIN",
          },
          409: {
            ...errorSchema,
            description: "E-mail já existe",
          },
        },
      },
    },
    async (request, reply) => {
      const body = createBarberByAdminSchema.parse(request.body);
      const result = await deps.createBarberByAdmin.execute(body);
      void reply.status(201).send(result);
    },
  );

  app.post(
    "/admin/users",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Criar cliente (admin)",
        security: [{ bearerAuth: [] }],
        body: createClientAdminBodySchema,
        response: {
          201: { type: "object", properties: { userId: { type: "string", format: "uuid" } } },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          409: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const body = createClientByAdminSchema.parse(request.body);
      const result = await deps.createClientByAdmin.execute(body);
      void reply.status(201).send(result);
    },
  );

  app.get(
    "/admin/users",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Listar utilizadores",
        security: [{ bearerAuth: [] }],
        querystring: includeDeletedQuerySchema,
        response: {
          200: { type: "array", items: { type: "object", additionalProperties: true } },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const query = adminListQuerySchema.parse(request.query);
      const rows = await deps.listUsersAdmin.execute(query);
      void reply.send(rows);
    },
  );

  app.get(
    "/admin/users/:id",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Obter utilizador por ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        querystring: includeDeletedQuerySchema,
        response: {
          200: { type: "object", additionalProperties: true },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = adminListQuerySchema.parse(request.query);
      const row = await deps.getUserAdmin.execute(id, query);
      void reply.send(row);
    },
  );

  app.patch(
    "/admin/users/:id",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Atualizar utilizador",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: updateUserAdminBodySchema,
        response: {
          204: { description: "Atualizado" },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateUserByAdminSchema.parse(request.body);
      await deps.updateUserAdmin.execute(id, body);
      void reply.status(204).send();
    },
  );

  app.delete(
    "/admin/users/:id",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Apagar utilizador (soft delete)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: {
          204: { description: "Apagado" },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deps.softDeleteUserAdmin.execute(id);
      void reply.status(204).send();
    },
  );

  app.post(
    "/admin/users/:id/restore",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Restaurar utilizador",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: {
          204: { description: "Restaurado" },
          400: { ...errorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deps.restoreUserAdmin.execute(id);
      void reply.status(204).send();
    },
  );

  app.get(
    "/admin/barbers",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Listar barbeiros",
        security: [{ bearerAuth: [] }],
        querystring: includeDeletedQuerySchema,
        response: {
          200: { type: "array", items: { type: "object", additionalProperties: true } },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const query = adminListQuerySchema.parse(request.query);
      const rows = await deps.listBarbersAdmin.execute(query);
      void reply.send(rows);
    },
  );

  app.get(
    "/admin/barbers/:id",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Obter barbeiro por ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        querystring: includeDeletedQuerySchema,
        response: {
          200: { type: "object", additionalProperties: true },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = adminListQuerySchema.parse(request.query);
      const row = await deps.getBarberAdmin.execute(id, query);
      void reply.send(row);
    },
  );

  app.patch(
    "/admin/barbers/:id",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Atualizar dados do utilizador ligado ao barbeiro",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: updateBarberAdminBodySchema,
        response: {
          204: { description: "Atualizado" },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateBarberLinkedUserSchema.parse(request.body);
      await deps.updateBarberAdmin.execute(id, body);
      void reply.status(204).send();
    },
  );

  app.delete(
    "/admin/barbers/:id",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Apagar barbeiro e utilizador (soft delete)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: {
          204: { description: "Apagado" },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deps.softDeleteBarberAdmin.execute(id);
      void reply.status(204).send();
    },
  );

  const barberServicesParams = {
    type: "object" as const,
    required: ["barberId"],
    properties: { barberId: { type: "string", format: "uuid" } },
  };
  const barberServicesItemParams = {
    type: "object" as const,
    required: ["barberId", "serviceId"],
    properties: {
      barberId: { type: "string", format: "uuid" },
      serviceId: { type: "string", format: "uuid" },
    },
  };

  app.get(
    "/admin/barbers/:barberId/services",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Listar serviços do barbeiro (admin)",
        security: [{ bearerAuth: [] }],
        params: barberServicesParams,
        querystring: includeDeletedQuerySchema,
        response: {
          200: { type: "array", items: { type: "object", additionalProperties: true } },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { barberId } = request.params as { barberId: string };
      const query = adminListQuerySchema.parse(request.query);
      const rows = await deps.listServicesByBarberAdmin.execute(barberId, query.includeDeleted === true);
      void reply.send(rows);
    },
  );

  app.post(
    "/admin/barbers/:barberId/services",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Criar serviço para o barbeiro (admin)",
        security: [{ bearerAuth: [] }],
        params: barberServicesParams,
        body: createServiceBodySchema,
        response: {
          201: { description: "Serviço criado", ...createServiceResponseSchema },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { barberId } = request.params as { barberId: string };
      const body = createServiceSchema.parse(request.body);
      const result = await deps.createServiceAdmin.execute(barberId, body);
      void reply.status(201).send(result);
    },
  );

  app.patch(
    "/admin/barbers/:barberId/services/:serviceId",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Atualizar serviço do barbeiro (admin)",
        security: [{ bearerAuth: [] }],
        params: barberServicesItemParams,
        body: updateServiceBodySchema,
        response: {
          204: { description: "Atualizado" },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { barberId, serviceId } = request.params as { barberId: string; serviceId: string };
      const body = updateServiceSchema.parse(request.body);
      await deps.updateServiceAdmin.execute(barberId, serviceId, body);
      void reply.status(204).send();
    },
  );

  app.delete(
    "/admin/barbers/:barberId/services/:serviceId",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Apagar serviço do barbeiro (soft delete)",
        security: [{ bearerAuth: [] }],
        params: barberServicesItemParams,
        response: {
          204: { description: "Apagado" },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { barberId, serviceId } = request.params as { barberId: string; serviceId: string };
      await deps.softDeleteServiceAdmin.execute(barberId, serviceId);
      void reply.status(204).send();
    },
  );

  app.post(
    "/admin/barbers/:barberId/services/:serviceId/restore",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Restaurar serviço do barbeiro",
        security: [{ bearerAuth: [] }],
        params: barberServicesItemParams,
        response: {
          204: { description: "Restaurado" },
          400: { ...errorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { barberId, serviceId } = request.params as { barberId: string; serviceId: string };
      await deps.restoreServiceAdmin.execute(barberId, serviceId);
      void reply.status(204).send();
    },
  );

  app.post(
    "/admin/barbers/:id/restore",
    {
      preHandler: adminPre,
      schema: {
        tags: ["admin"],
        summary: "Restaurar barbeiro e utilizador",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: {
          204: { description: "Restaurado" },
          400: { ...errorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deps.restoreBarberAdmin.execute(id);
      void reply.status(204).send();
    },
  );
}
