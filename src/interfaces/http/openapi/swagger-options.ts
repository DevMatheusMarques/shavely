/** Opções @fastify/swagger (modo dinâmico + OpenAPI 3). */

export const swaggerOptions = {
  mode: "dynamic" as const,
  /** Garante campo `openapi` no documento (evita UI/clientes a falharem a validar a versão). */
  transformObject: ((documentObject: {
    openapiObject?: { openapi?: string };
    swaggerObject?: unknown;
  }) => {
    if (documentObject.openapiObject) {
      const o = documentObject.openapiObject;
      if (typeof o.openapi !== "string" || o.openapi.trim() === "") {
        o.openapi = "3.0.3";
      }
      return documentObject.openapiObject;
    }
    return documentObject.swaggerObject as object;
  }) as never,
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "Shavely API",
      description:
        "API REST para agendamento em barbearia (Clean Architecture + DDD). " +
        "Autenticação JWT (papéis ADMIN, BARBER e CLIENT). Eventos assíncronos via RabbitMQ.",
      version: "1.0.0",
    },
    servers: [
      { url: "/", description: "Servidor atual (mesmo host/porta)" },
      { url: "http://localhost:3000", description: "Desenvolvimento local" },
    ],
    tags: [
      { name: "system", description: "Saúde da aplicação" },
      { name: "auth", description: "Registo e login" },
      { name: "admin", description: "Operações administrativas (ADMIN)" },
      { name: "barbers", description: "Serviços e disponibilidade (BARBER)" },
      { name: "notifications", description: "Tokens push (FCM)" },
      { name: "appointments", description: "Agendamentos" },
      { name: "public", description: "Sem autenticação" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http" as const,
          scheme: "bearer" as const,
          bearerFormat: "JWT",
          description: "Token de POST /auth/login — enviar como Authorization: Bearer &lt;token&gt;",
        },
      },
    },
    externalDocs: {
      description: "Especificação OpenAPI",
      url: "https://swagger.io/specification/",
    },
  },
};
