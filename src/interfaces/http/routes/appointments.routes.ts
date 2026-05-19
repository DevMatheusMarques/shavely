import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { adminListQuerySchema } from "../../../application/dto/admin.dto.js";
import {
  createAppointmentSchema,
  listAppointmentsQuerySchema as listAppointmentsQueryDto,
  updateAppointmentSchema,
} from "../../../application/dto/appointment.dto.js";
import type {
  RestoreAppointmentAdminUseCase,
  SoftDeleteAppointmentAdminUseCase,
  UpdateAppointmentUseCase,
} from "../../../application/use-cases/appointments/appointment-admin-crud.use-case.js";
import type { CancelAppointmentUseCase } from "../../../application/use-cases/appointments/cancel-appointment.use-case.js";
import type { CreateAppointmentUseCase } from "../../../application/use-cases/appointments/create-appointment.use-case.js";
import type { GetAppointmentUseCase } from "../../../application/use-cases/appointments/get-appointment.use-case.js";
import type { ListAppointmentsUseCase } from "../../../application/use-cases/appointments/list-appointments.use-case.js";
import {
  appointmentRowSchema,
  cancelAppointmentResponseSchema,
  createAppointmentBodySchema,
  createAppointmentResponseSchema,
  errorSchema,
  includeDeletedQuerySchema,
  listAppointmentsQuerySchema as listAppointmentsQueryOpenApi,
  updateAppointmentBodySchema,
  validationErrorSchema,
} from "../openapi/schemas.js";

export function registerAppointmentRoutes(
  app: FastifyInstance,
  deps: {
    createAppointment: CreateAppointmentUseCase;
    cancelAppointment: CancelAppointmentUseCase;
    listAppointments: ListAppointmentsUseCase;
    getAppointment: GetAppointmentUseCase;
    updateAppointment: UpdateAppointmentUseCase;
    softDeleteAppointmentAdmin: SoftDeleteAppointmentAdminUseCase;
    restoreAppointmentAdmin: RestoreAppointmentAdminUseCase;
  },
  authenticate: preHandlerHookHandler,
): void {
  app.post(
    "/appointments",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Criar agendamento",
        description:
          "Papel CLIENT. Valida disponibilidade do barbeiro, duração do serviço e evita sobreposição. Publica evento assíncrono (outbox).",
        security: [{ bearerAuth: [] }],
        body: createAppointmentBodySchema,
        response: {
          201: {
            description: "Agendamento criado",
            ...createAppointmentResponseSchema,
          },
          400: { ...validationErrorSchema, description: "Validação ou regra de negócio" },
          401: { ...errorSchema, description: "Não autenticado" },
          403: { ...errorSchema, description: "Apenas clientes podem criar" },
          404: { ...errorSchema, description: "Barbeiro/serviço não encontrado" },
          409: { ...errorSchema, description: "Conflito de horário (double booking)" },
        },
      },
    },
    async (request, reply) => {
      const body = createAppointmentSchema.parse(request.body);
      const r = request.requester!;
      const result = await deps.createAppointment.execute(r, body);
      void reply.status(201).send(result);
    },
  );

  app.get(
    "/appointments",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Listar agendamentos",
        description:
          "ADMIN: filtros opcionais barberId/clientId/datas. CLIENT: só os próprios. BARBER: só os do seu perfil.",
        security: [{ bearerAuth: [] }],
        querystring: listAppointmentsQueryOpenApi,
        response: {
          200: {
            description: "Lista de agendamentos",
            type: "array",
            items: appointmentRowSchema,
          },
          400: { ...validationErrorSchema, description: "Query inválida" },
          401: { ...errorSchema, description: "Não autenticado" },
          403: { ...errorSchema, description: "Sem permissão para o filtro" },
          404: { ...errorSchema, description: "Perfil barbeiro em falta (BARBER)" },
        },
      },
    },
    async (request, reply) => {
      const query = listAppointmentsQueryDto.parse(request.query);
      const r = request.requester!;
      const rows = await deps.listAppointments.execute(r, query);
      void reply.send(
        rows.map((a) => ({
          id: a.id,
          clientId: a.clientId,
          barberId: a.barberId,
          serviceId: a.serviceId,
          startsAt: a.startsAt.toISOString(),
          endsAt: a.endsAt.toISOString(),
          status: a.status,
        })),
      );
    },
  );

  app.get(
    "/appointments/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Obter agendamento por ID",
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
      const q = adminListQuerySchema.parse(request.query);
      const r = request.requester!;
      const row = await deps.getAppointment.execute(r, id, q.includeDeleted);
      void reply.send(row);
    },
  );

  app.patch(
    "/appointments/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Atualizar agendamento (reagendar / trocar serviço)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: updateAppointmentBodySchema,
        response: {
          204: { description: "Atualizado" },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
          409: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateAppointmentSchema.parse(request.body);
      const r = request.requester!;
      await deps.updateAppointment.execute(r, id, body);
      void reply.status(204).send();
    },
  );

  app.patch(
    "/appointments/:id/cancel",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Cancelar agendamento",
        description:
          "Cliente (dono), barbeiro do slot ou ADMIN. Respeita política de cancelamento (mínimo 2h antes).",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid", description: "ID do agendamento" },
          },
        },
        response: {
          200: {
            description: "Cancelado; opcional link WhatsApp",
            ...cancelAppointmentResponseSchema,
          },
          400: { ...validationErrorSchema, description: "Já cancelado ou política de tempo" },
          401: { ...errorSchema, description: "Não autenticado" },
          403: { ...errorSchema, description: "Sem permissão" },
          404: { ...errorSchema, description: "Agendamento não encontrado" },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const r = request.requester!;
      const result = await deps.cancelAppointment.execute(r, id);
      void reply.send(result);
    },
  );

  app.delete(
    "/appointments/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Apagar agendamento (soft delete, apenas ADMIN)",
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
      const r = request.requester!;
      await deps.softDeleteAppointmentAdmin.execute(r, id);
      void reply.status(204).send();
    },
  );

  app.post(
    "/appointments/:id/restore",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["appointments"],
        summary: "Restaurar agendamento (apenas ADMIN)",
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
      const r = request.requester!;
      await deps.restoreAppointmentAdmin.execute(r, id);
      void reply.status(204).send();
    },
  );
}
