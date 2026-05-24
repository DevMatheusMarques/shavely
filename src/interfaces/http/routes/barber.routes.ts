import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import {
  createAvailabilitySlotSchema,
  setAvailabilitySchema,
  updateAvailabilitySlotSchema,
} from "../../../application/dto/service.dto.js";
import { registerDeviceTokenSchema } from "../../../application/dto/appointment.dto.js";
import type {
  CreateAvailabilitySlotUseCase,
  GetAvailabilitySlotUseCase,
  ListMyAvailabilityUseCase,
  RestoreAvailabilitySlotUseCase,
  SoftDeleteAvailabilitySlotUseCase,
  UpdateAvailabilitySlotUseCase,
} from "../../../application/use-cases/barbers/barber-availability-crud.use-case.js";
import type { SetBarberAvailabilityUseCase } from "../../../application/use-cases/barbers/set-barber-availability.use-case.js";
import type { RegisterDeviceTokenUseCase } from "../../../application/use-cases/notifications/register-device-token.use-case.js";
import type { ListMyAssignedServicesUseCase } from "../../../application/use-cases/services/barber-service-assignment.use-case.js";
import { createRequireRoles } from "../auth/authenticate.js";
import { Role } from "../../../domain/value-objects/role.js";
import {
  availabilitySlotPatchSchema,
  availabilitySlotWriteSchema,
  errorSchema,
  serviceCatalogRowSchema,
  setAvailabilityBodySchema,
  validationErrorSchema,
} from "../openapi/schemas.js";
import { adminListQuerySchema } from "../../../application/dto/admin.dto.js";

export function registerBarberRoutes(
  app: FastifyInstance,
  deps: {
    setAvailability: SetBarberAvailabilityUseCase;
    registerDeviceToken: RegisterDeviceTokenUseCase;
    listMyAssignedServices: ListMyAssignedServicesUseCase;
    listMyAvailability: ListMyAvailabilityUseCase;
    createAvailabilitySlot: CreateAvailabilitySlotUseCase;
    getAvailabilitySlot: GetAvailabilitySlotUseCase;
    updateAvailabilitySlot: UpdateAvailabilitySlotUseCase;
    softDeleteAvailabilitySlot: SoftDeleteAvailabilitySlotUseCase;
    restoreAvailabilitySlot: RestoreAvailabilitySlotUseCase;
  },
  authenticate: preHandlerHookHandler,
): void {
  const requireBarber = createRequireRoles(Role.BARBER);

  app.get(
    "/barbers/me/services",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Listar serviços do catálogo associados a mim",
        description: "Apenas leitura. O catálogo e as associações são geridos pelo ADMIN.",
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: "array", items: serviceCatalogRowSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const r = request.requester!;
      const rows = await deps.listMyAssignedServices.execute(r);
      void reply.send(rows);
    },
  );

  app.post(
    "/barbers/me/availability",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Definir disponibilidade",
        description:
          "Substitui todos os intervalos de disponibilidade do barbeiro. Horários em minutos desde meia-noite (UTC no modelo atual).",
        security: [{ bearerAuth: [] }],
        body: setAvailabilityBodySchema,
        response: {
          204: {
            description: "Disponibilidade atualizada (sem corpo)",
          },
          400: { ...validationErrorSchema, description: "Validação ou intervalos inválidos" },
          401: { ...errorSchema, description: "Não autenticado" },
          403: { ...errorSchema, description: "Não é barbeiro" },
          404: { ...errorSchema, description: "Perfil barbeiro em falta" },
        },
      },
    },
    async (request, reply) => {
      const body = setAvailabilitySchema.parse(request.body);
      const r = request.requester!;
      await deps.setAvailability.execute(r, body);
      void reply.status(204).send();
    },
  );

  app.get(
    "/barbers/me/availability",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Listar intervalos de disponibilidade",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            includeDeleted: { type: "string", enum: ["true", "false"] },
          },
        },
        response: {
          200: { type: "array", items: { type: "object", additionalProperties: true } },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const q = adminListQuerySchema.parse(request.query);
      const r = request.requester!;
      const rows = await deps.listMyAvailability.execute(r, q.includeDeleted);
      void reply.send(rows);
    },
  );

  app.post(
    "/barbers/me/availability/slots",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Criar intervalo de disponibilidade",
        security: [{ bearerAuth: [] }],
        body: availabilitySlotWriteSchema,
        response: {
          201: { type: "object", properties: { id: { type: "string", format: "uuid" } } },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const body = createAvailabilitySlotSchema.parse(request.body);
      const r = request.requester!;
      const result = await deps.createAvailabilitySlot.execute(r, body);
      void reply.status(201).send(result);
    },
  );

  app.get(
    "/barbers/me/availability/slots/:slotId",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Obter intervalo de disponibilidade",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["slotId"],
          properties: { slotId: { type: "string", format: "uuid" } },
        },
        querystring: {
          type: "object",
          properties: {
            includeDeleted: { type: "string", enum: ["true", "false"] },
          },
        },
        response: {
          200: { type: "object", additionalProperties: true },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { slotId } = request.params as { slotId: string };
      const q = adminListQuerySchema.parse(request.query);
      const r = request.requester!;
      const row = await deps.getAvailabilitySlot.execute(r, slotId, q.includeDeleted);
      void reply.send(row);
    },
  );

  app.patch(
    "/barbers/me/availability/slots/:slotId",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Atualizar intervalo de disponibilidade",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["slotId"],
          properties: { slotId: { type: "string", format: "uuid" } },
        },
        body: availabilitySlotPatchSchema,
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
      const { slotId } = request.params as { slotId: string };
      const body = updateAvailabilitySlotSchema.parse(request.body);
      const r = request.requester!;
      await deps.updateAvailabilitySlot.execute(r, slotId, body);
      void reply.status(204).send();
    },
  );

  app.delete(
    "/barbers/me/availability/slots/:slotId",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Apagar intervalo (soft delete)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["slotId"],
          properties: { slotId: { type: "string", format: "uuid" } },
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
      const { slotId } = request.params as { slotId: string };
      const r = request.requester!;
      await deps.softDeleteAvailabilitySlot.execute(r, slotId);
      void reply.status(204).send();
    },
  );

  app.post(
    "/barbers/me/availability/slots/:slotId/restore",
    {
      preHandler: [authenticate, requireBarber],
      schema: {
        tags: ["barbers"],
        summary: "Restaurar intervalo de disponibilidade",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["slotId"],
          properties: { slotId: { type: "string", format: "uuid" } },
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
      const { slotId } = request.params as { slotId: string };
      const r = request.requester!;
      await deps.restoreAvailabilitySlot.execute(r, slotId);
      void reply.status(204).send();
    },
  );

  app.post(
    "/me/device-tokens",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["notifications"],
        summary: "Registar token FCM",
        description: "Guarda token do dispositivo para push (Firebase Cloud Messaging). Qualquer utilizador autenticado.",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["token", "platform"],
          properties: {
            token: { type: "string", minLength: 10 },
            platform: { type: "string", enum: ["ios", "android", "web"] },
          },
        },
        response: {
          204: { description: "Token registado" },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const body = registerDeviceTokenSchema.parse(request.body);
      const r = request.requester!;
      await deps.registerDeviceToken.execute(r, body);
      void reply.status(204).send();
    },
  );
}
