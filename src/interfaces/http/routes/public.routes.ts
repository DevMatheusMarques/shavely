import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ListBookableBarbersUseCase } from "../../../application/use-cases/barbers/list-bookable-barbers.use-case.js";
import type { ListServicesByBarberUseCase } from "../../../application/use-cases/services/list-services-by-barber.use-case.js";
import { publicBookableBarberSchema, publicServiceRowSchema, validationErrorSchema } from "../openapi/schemas.js";

const barberIdParam = z.object({ barberId: z.string().uuid() });

export function registerPublicRoutes(
  app: FastifyInstance,
  deps: { listBookableBarbers: ListBookableBarbersUseCase; listServicesByBarber: ListServicesByBarberUseCase },
): void {
  app.get(
    "/barbers",
    {
      schema: {
        tags: ["public"],
        summary: "Listar barbeiros para marcação",
        description: "Sem autenticação. Apenas barbeiros activos (nome + id).",
        response: {
          200: {
            description: "Lista de barbeiros",
            type: "array",
            items: publicBookableBarberSchema,
          },
        },
      },
    },
    async (_request, reply) => {
      const rows = await deps.listBookableBarbers.execute();
      void reply.send(rows);
    },
  );

  app.get(
    "/barbers/:barberId/services",
    {
      schema: {
        tags: ["public"],
        summary: "Listar serviços do barbeiro",
        description: "Sem autenticação. Usado para montar UI de marcação.",
        params: {
          type: "object",
          required: ["barberId"],
          properties: {
            barberId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Lista de serviços",
            type: "array",
            items: publicServiceRowSchema,
          },
          400: {
            ...validationErrorSchema,
            description: "Parâmetro inválido",
          },
        },
      },
    },
    async (request, reply) => {
      const { barberId } = barberIdParam.parse(request.params);
      const services = await deps.listServicesByBarber.execute(barberId);
      void reply.send(
        services.map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMinutes,
          priceCents: s.priceCents,
        })),
      );
    },
  );
}
