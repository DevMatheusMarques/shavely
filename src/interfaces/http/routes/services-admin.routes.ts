import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { adminListQuerySchema } from "../../../application/dto/admin.dto.js";
import {
  assignBarberToServiceSchema,
  createServiceSchema,
  updateServiceSchema,
} from "../../../application/dto/service.dto.js";
import type {
  AssignBarberToServiceUseCase,
  ListBarbersForServiceUseCase,
  ListServicesForBarberUseCase,
  RestoreBarberServiceAssignmentUseCase,
  UnassignBarberFromServiceUseCase,
} from "../../../application/use-cases/services/barber-service-assignment.use-case.js";
import type {
  CreateServiceCatalogUseCase,
  GetServiceCatalogUseCase,
  ListServicesCatalogUseCase,
  RestoreServiceCatalogUseCase,
  SoftDeleteServiceCatalogUseCase,
  UpdateServiceCatalogUseCase,
} from "../../../application/use-cases/services/service-catalog.use-case.js";
import {
  assignBarberToServiceBodySchema,
  createServiceBodySchema,
  createServiceResponseSchema,
  errorSchema,
  includeDeletedQuerySchema,
  serviceCatalogRowSchema,
  updateServiceBodySchema,
  validationErrorSchema,
} from "../openapi/schemas.js";

const serviceIdParam = {
  type: "object" as const,
  required: ["serviceId"],
  properties: { serviceId: { type: "string", format: "uuid" } },
};

const serviceBarberParams = {
  type: "object" as const,
  required: ["serviceId", "barberId"],
  properties: {
    serviceId: { type: "string", format: "uuid" },
    barberId: { type: "string", format: "uuid" },
  },
};

const barberIdParamOnly = z.object({ barberId: z.string().uuid() });

export function registerServicesAdminRoutes(
  app: FastifyInstance,
  deps: {
    createServiceCatalog: CreateServiceCatalogUseCase;
    listServicesCatalog: ListServicesCatalogUseCase;
    getServiceCatalog: GetServiceCatalogUseCase;
    updateServiceCatalog: UpdateServiceCatalogUseCase;
    softDeleteServiceCatalog: SoftDeleteServiceCatalogUseCase;
    restoreServiceCatalog: RestoreServiceCatalogUseCase;
    assignBarberToService: AssignBarberToServiceUseCase;
    unassignBarberFromService: UnassignBarberFromServiceUseCase;
    restoreBarberServiceAssignment: RestoreBarberServiceAssignmentUseCase;
    listBarbersForService: ListBarbersForServiceUseCase;
    listServicesForBarber: ListServicesForBarberUseCase;
  },
  authenticate: preHandlerHookHandler,
  requireAdmin: preHandlerHookHandler,
): void {
  const adminPre = [authenticate, requireAdmin];

  app.post(
    "/admin/services",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Criar serviço no catálogo",
        description: "O serviço existe de forma independente; associe barbeiros em seguida.",
        security: [{ bearerAuth: [] }],
        body: createServiceBodySchema,
        response: {
          201: { description: "Serviço criado", ...createServiceResponseSchema },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const body = createServiceSchema.parse(request.body);
      const result = await deps.createServiceCatalog.execute(body);
      void reply.status(201).send(result);
    },
  );

  app.get(
    "/admin/services",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Listar catálogo de serviços",
        security: [{ bearerAuth: [] }],
        querystring: includeDeletedQuerySchema,
        response: {
          200: { type: "array", items: serviceCatalogRowSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const q = adminListQuerySchema.parse(request.query);
      const rows = await deps.listServicesCatalog.execute(q.includeDeleted);
      void reply.send(rows);
    },
  );

  app.get(
    "/admin/services/:serviceId",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Obter serviço do catálogo",
        security: [{ bearerAuth: [] }],
        params: serviceIdParam,
        querystring: includeDeletedQuerySchema,
        response: {
          200: serviceCatalogRowSchema,
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { serviceId } = request.params as { serviceId: string };
      const q = adminListQuerySchema.parse(request.query);
      const row = await deps.getServiceCatalog.execute(serviceId, q.includeDeleted);
      void reply.send(row);
    },
  );

  app.patch(
    "/admin/services/:serviceId",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Atualizar serviço do catálogo",
        security: [{ bearerAuth: [] }],
        params: serviceIdParam,
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
      const { serviceId } = request.params as { serviceId: string };
      const body = updateServiceSchema.parse(request.body);
      await deps.updateServiceCatalog.execute(serviceId, body);
      void reply.status(204).send();
    },
  );

  app.delete(
    "/admin/services/:serviceId",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Apagar serviço do catálogo (soft delete)",
        security: [{ bearerAuth: [] }],
        params: serviceIdParam,
        response: {
          204: { description: "Apagado" },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { serviceId } = request.params as { serviceId: string };
      await deps.softDeleteServiceCatalog.execute(serviceId);
      void reply.status(204).send();
    },
  );

  app.post(
    "/admin/services/:serviceId/restore",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Restaurar serviço do catálogo",
        security: [{ bearerAuth: [] }],
        params: serviceIdParam,
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
      const { serviceId } = request.params as { serviceId: string };
      await deps.restoreServiceCatalog.execute(serviceId);
      void reply.status(204).send();
    },
  );

  app.get(
    "/admin/services/:serviceId/barbers",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Listar barbeiros associados ao serviço",
        security: [{ bearerAuth: [] }],
        params: serviceIdParam,
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
      const { serviceId } = request.params as { serviceId: string };
      const q = adminListQuerySchema.parse(request.query);
      const rows = await deps.listBarbersForService.execute(serviceId, q.includeDeleted);
      void reply.send(rows);
    },
  );

  app.post(
    "/admin/services/:serviceId/barbers",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Associar barbeiro ao serviço",
        security: [{ bearerAuth: [] }],
        params: serviceIdParam,
        body: assignBarberToServiceBodySchema,
        response: {
          201: {
            type: "object",
            properties: { assignmentId: { type: "string", format: "uuid" } },
          },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
          409: { ...errorSchema, description: "Já associado" },
        },
      },
    },
    async (request, reply) => {
      const { serviceId } = request.params as { serviceId: string };
      const { barberId } = assignBarberToServiceSchema.parse(request.body);
      const result = await deps.assignBarberToService.execute(serviceId, barberId);
      void reply.status(201).send(result);
    },
  );

  app.delete(
    "/admin/services/:serviceId/barbers/:barberId",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Remover associação barbeiro ↔ serviço (soft delete)",
        security: [{ bearerAuth: [] }],
        params: serviceBarberParams,
        response: {
          204: { description: "Desassociado" },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { serviceId, barberId } = request.params as { serviceId: string; barberId: string };
      await deps.unassignBarberFromService.execute(serviceId, barberId);
      void reply.status(204).send();
    },
  );

  app.post(
    "/admin/services/:serviceId/barbers/:barberId/restore",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Restaurar associação barbeiro ↔ serviço",
        security: [{ bearerAuth: [] }],
        params: serviceBarberParams,
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
      const { serviceId, barberId } = request.params as { serviceId: string; barberId: string };
      await deps.restoreBarberServiceAssignment.execute(serviceId, barberId);
      void reply.status(204).send();
    },
  );

  app.get(
    "/admin/barbers/:barberId/services",
    {
      preHandler: adminPre,
      schema: {
        tags: ["services"],
        summary: "Listar serviços associados a um barbeiro",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["barberId"],
          properties: { barberId: { type: "string", format: "uuid" } },
        },
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
      const { barberId } = barberIdParamOnly.parse(request.params);
      const q = adminListQuerySchema.parse(request.query);
      const rows = await deps.listServicesForBarber.execute(barberId, q.includeDeleted);
      void reply.send(rows);
    },
  );
}
