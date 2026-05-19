import type { FastifyInstance } from "fastify";

export async function registerRequestLogging(app: FastifyInstance): Promise<void> {
  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      "http",
    );
  });
}
