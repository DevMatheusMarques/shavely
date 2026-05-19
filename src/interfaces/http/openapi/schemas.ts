/** Schemas JSON Schema (OpenAPI 3) partilhados entre rotas. */

/** Corpo de erro de domínio (sem description HTTP — define-se na rota). */
export const errorSchema = {
  type: "object" as const,
  properties: {
    code: { type: "string", description: "Código estável do erro" },
    message: { type: "string", description: "Mensagem legível" },
  },
  required: ["code", "message"],
};

export const validationErrorSchema = {
  type: "object" as const,
  properties: {
    code: { type: "string", example: "VALIDATION_ERROR" },
    message: { type: "string" },
    details: { type: "object", additionalProperties: true },
  },
};

export const healthResponseSchema = {
  type: "object" as const,
  properties: {
    ok: { type: "boolean", example: true },
  },
};

export const registerBodySchema = {
  type: "object" as const,
  required: ["email", "password", "name"],
  properties: {
    email: { type: "string", format: "email", description: "E-mail único" },
    password: { type: "string", minLength: 8, description: "Mínimo 8 caracteres" },
    name: { type: "string", minLength: 2, maxLength: 120 },
    phoneE164: {
      type: "string",
      description: "Opcional. E.164, ex: +5511999999999",
      pattern: "^\\+[1-9]\\d{7,14}$",
    },
  },
};

export const registerResponseSchema = {
  type: "object" as const,
  properties: {
    userId: { type: "string", format: "uuid" },
  },
};

export const loginBodySchema = {
  type: "object" as const,
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
};

export const loginResponseSchema = {
  type: "object" as const,
  properties: {
    accessToken: { type: "string", description: "JWT Bearer" },
  },
};

export const createBarberAdminBodySchema = {
  type: "object" as const,
  required: ["email", "password", "name"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    name: { type: "string", minLength: 2, maxLength: 120 },
    phoneE164: {
      type: "string",
      description: "Telefone do barbeiro para links WhatsApp (E.164)",
      pattern: "^\\+[1-9]\\d{7,14}$",
    },
  },
};

export const createBarberAdminResponseSchema = {
  type: "object" as const,
  properties: {
    userId: { type: "string", format: "uuid" },
    barberId: { type: "string", format: "uuid" },
  },
};

export const includeDeletedQuerySchema = {
  type: "object" as const,
  properties: {
    includeDeleted: {
      type: "string",
      enum: ["true", "false"],
      description: "Incluir registos com soft delete",
    },
  },
};

export const createClientAdminBodySchema = {
  type: "object" as const,
  required: ["email", "password", "name"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    name: { type: "string", minLength: 2, maxLength: 120 },
    phoneE164: {
      type: "string",
      pattern: "^\\+[1-9]\\d{7,14}$",
    },
  },
};

export const updateUserAdminBodySchema = {
  type: "object" as const,
  properties: {
    name: { type: "string", minLength: 2, maxLength: 120 },
    phoneE164: { type: "string", nullable: true, pattern: "^\\+[1-9]\\d{7,14}$" },
    role: { type: "string", enum: ["ADMIN", "BARBER", "CLIENT"] },
  },
};

export const updateBarberAdminBodySchema = {
  type: "object" as const,
  properties: {
    name: { type: "string", minLength: 2, maxLength: 120 },
    phoneE164: { type: "string", nullable: true, pattern: "^\\+[1-9]\\d{7,14}$" },
  },
};

export const updateServiceBodySchema = {
  type: "object" as const,
  properties: {
    name: { type: "string", minLength: 2, maxLength: 120 },
    durationMinutes: { type: "integer", minimum: 15, maximum: 480 },
    priceCents: { type: "integer", minimum: 0 },
  },
};

export const updateAppointmentBodySchema = {
  type: "object" as const,
  properties: {
    serviceId: { type: "string", format: "uuid" },
    startsAt: { type: "string", format: "date-time" },
  },
};

export const availabilitySlotWriteSchema = {
  type: "object" as const,
  required: ["weekday", "startMinutes", "endMinutes"],
  properties: {
    weekday: { type: "integer", minimum: 0, maximum: 6 },
    startMinutes: { type: "integer", minimum: 0, maximum: 1439 },
    endMinutes: { type: "integer", minimum: 1, maximum: 1440 },
  },
};

export const availabilitySlotPatchSchema = {
  type: "object" as const,
  properties: {
    weekday: { type: "integer", minimum: 0, maximum: 6 },
    startMinutes: { type: "integer", minimum: 0, maximum: 1439 },
    endMinutes: { type: "integer", minimum: 1, maximum: 1440 },
  },
};

export const createServiceBodySchema = {
  type: "object" as const,
  required: ["name", "durationMinutes", "priceCents"],
  properties: {
    name: { type: "string", minLength: 2, maxLength: 120 },
    durationMinutes: { type: "integer", minimum: 15, maximum: 480 },
    priceCents: { type: "integer", minimum: 0 },
  },
};

export const createServiceResponseSchema = {
  type: "object" as const,
  properties: {
    serviceId: { type: "string", format: "uuid" },
  },
};

export const availabilitySlotSchema = {
  type: "object" as const,
  required: ["weekday", "startMinutes", "endMinutes"],
  properties: {
    weekday: { type: "integer", minimum: 0, maximum: 6, description: "0=domingo … 6=sábado (UTC)" },
    startMinutes: { type: "integer", minimum: 0, maximum: 1439, description: "Minutos desde meia-noite" },
    endMinutes: { type: "integer", minimum: 1, maximum: 1440 },
  },
};

export const setAvailabilityBodySchema = {
  type: "object" as const,
  required: ["slots"],
  properties: {
    slots: {
      type: "array",
      minItems: 1,
      items: availabilitySlotSchema,
    },
  },
};

export const deviceTokenBodySchema = {
  type: "object" as const,
  required: ["token", "platform"],
  properties: {
    token: { type: "string", minLength: 10, description: "Token FCM" },
    platform: { type: "string", enum: ["ios", "android", "web"] },
  },
};

export const createAppointmentBodySchema = {
  type: "object" as const,
  required: ["barberId", "serviceId", "startsAt"],
  properties: {
    barberId: { type: "string", format: "uuid" },
    serviceId: { type: "string", format: "uuid" },
    startsAt: {
      type: "string",
      format: "date-time",
      description: "Início do agendamento (ISO 8601)",
    },
  },
};

export const createAppointmentResponseSchema = {
  type: "object" as const,
  properties: {
    appointmentId: { type: "string", format: "uuid" },
    whatsappLink: {
      type: "string",
      nullable: true,
      description: "Link wa.me se o barbeiro tiver telefone configurado",
    },
  },
};

export const appointmentRowSchema = {
  type: "object" as const,
  properties: {
    id: { type: "string", format: "uuid" },
    clientId: { type: "string", format: "uuid" },
    barberId: { type: "string", format: "uuid" },
    serviceId: { type: "string", format: "uuid" },
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", format: "date-time" },
    status: { type: "string", enum: ["SCHEDULED", "CANCELLED"] },
  },
};

export const listAppointmentsQuerySchema = {
  type: "object" as const,
  properties: {
    barberId: { type: "string", format: "uuid", description: "Filtro (tipicamente ADMIN)" },
    clientId: { type: "string", format: "uuid" },
    from: { type: "string", format: "date-time", description: "Início do intervalo" },
    to: { type: "string", format: "date-time", description: "Fim do intervalo" },
    includeDeleted: {
      type: "string",
      enum: ["true", "false"],
      description: "Apenas ADMIN: incluir soft-deleted",
    },
  },
};

export const cancelAppointmentResponseSchema = {
  type: "object" as const,
  properties: {
    whatsappLink: {
      type: "string",
      nullable: true,
      description: "Link wa.me opcional",
    },
  },
};

export const publicServiceRowSchema = {
  type: "object" as const,
  properties: {
    id: { type: "string", format: "uuid" },
    barberId: { type: "string", format: "uuid" },
    name: { type: "string" },
    durationMinutes: { type: "integer" },
    priceCents: { type: "integer" },
  },
};

export const productRowSchema = {
  type: "object" as const,
  properties: {
    id: { type: "string", format: "uuid" },
    sku: { type: "string" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    category: { type: "string", nullable: true },
    unit: { type: "string", description: "Unidade (un, ml, g, etc.)" },
    quantity: { type: "integer", description: "Quantidade atual" },
    minQuantity: { type: "integer", description: "Quantidade mínima" },
    costCents: { type: "integer", description: "Custo unitário em centavos" },
    isLowStock: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    deletedAt: { type: "string", format: "date-time", nullable: true },
  },
};

export const createProductBodySchema = {
  type: "object" as const,
  required: ["sku", "name", "unit"],
  properties: {
    sku: { type: "string", minLength: 1, maxLength: 64, pattern: "^[A-Za-z0-9._-]+$" },
    name: { type: "string", minLength: 2, maxLength: 160 },
    description: { type: "string", maxLength: 500, nullable: true },
    category: { type: "string", maxLength: 80, nullable: true },
    unit: { type: "string", minLength: 1, maxLength: 16 },
    quantity: { type: "integer", minimum: 0, default: 0 },
    minQuantity: { type: "integer", minimum: 0, default: 0 },
    costCents: { type: "integer", minimum: 0, default: 0 },
  },
};

export const createProductResponseSchema = {
  type: "object" as const,
  properties: { productId: { type: "string", format: "uuid" } },
};

export const updateProductBodySchema = {
  type: "object" as const,
  properties: {
    sku: { type: "string", minLength: 1, maxLength: 64, pattern: "^[A-Za-z0-9._-]+$" },
    name: { type: "string", minLength: 2, maxLength: 160 },
    description: { type: "string", maxLength: 500, nullable: true },
    category: { type: "string", maxLength: 80, nullable: true },
    unit: { type: "string", minLength: 1, maxLength: 16 },
    minQuantity: { type: "integer", minimum: 0 },
    costCents: { type: "integer", minimum: 0 },
  },
};

export const listProductsQueryOpenApiSchema = {
  type: "object" as const,
  properties: {
    search: { type: "string", description: "Procura por nome ou SKU" },
    category: { type: "string" },
    lowStock: { type: "string", enum: ["true", "false"], description: "Apenas com estoque baixo" },
    includeDeleted: { type: "string", enum: ["true", "false"] },
  },
};

export const stockMovementBodySchema = {
  type: "object" as const,
  required: ["type", "quantity"],
  properties: {
    type: { type: "string", enum: ["IN", "OUT", "ADJUSTMENT"] },
    quantity: {
      type: "integer",
      description:
        "IN/OUT: quantidade positiva. ADJUSTMENT: quantidade alvo (>= 0) que substituirá o estoque atual.",
    },
    reason: { type: "string", minLength: 1, maxLength: 255 },
  },
};

export const stockMovementRowSchema = {
  type: "object" as const,
  properties: {
    id: { type: "string", format: "uuid" },
    productId: { type: "string", format: "uuid" },
    type: { type: "string", enum: ["IN", "OUT", "ADJUSTMENT"] },
    quantity: { type: "integer", description: "Variação efetiva (positiva ou negativa)" },
    quantityAfter: { type: "integer", description: "Estoque após o movimento" },
    reason: { type: "string", nullable: true },
    performedByUserId: { type: "string", format: "uuid", nullable: true },
    createdAt: { type: "string", format: "date-time" },
  },
};

export const listMovementsQueryOpenApiSchema = {
  type: "object" as const,
  properties: {
    productId: { type: "string", format: "uuid" },
    type: { type: "string", enum: ["IN", "OUT", "ADJUSTMENT"] },
    from: { type: "string", format: "date-time" },
    to: { type: "string", format: "date-time" },
  },
};
