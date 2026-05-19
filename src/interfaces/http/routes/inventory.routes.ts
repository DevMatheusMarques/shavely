import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import {
  createProductSchema,
  listMovementsQuerySchema,
  listProductsQuerySchema,
  stockMovementSchema,
  updateProductSchema,
} from "../../../application/dto/inventory.dto.js";
import type { CreateProductUseCase } from "../../../application/use-cases/inventory/create-product.use-case.js";
import type { GetProductUseCase } from "../../../application/use-cases/inventory/get-product.use-case.js";
import type { ListProductsUseCase } from "../../../application/use-cases/inventory/list-products.use-case.js";
import type { ListStockMovementsUseCase } from "../../../application/use-cases/inventory/list-stock-movements.use-case.js";
import type { RegisterStockMovementUseCase } from "../../../application/use-cases/inventory/register-stock-movement.use-case.js";
import type { RestoreProductUseCase } from "../../../application/use-cases/inventory/restore-product.use-case.js";
import type { SoftDeleteProductUseCase } from "../../../application/use-cases/inventory/soft-delete-product.use-case.js";
import type { UpdateProductUseCase } from "../../../application/use-cases/inventory/update-product.use-case.js";
import { createRequireRoles } from "../auth/authenticate.js";
import { Role } from "../../../domain/value-objects/role.js";
import {
  createProductBodySchema,
  createProductResponseSchema,
  errorSchema,
  includeDeletedQuerySchema,
  listMovementsQueryOpenApiSchema,
  listProductsQueryOpenApiSchema,
  productRowSchema,
  stockMovementBodySchema,
  stockMovementRowSchema,
  updateProductBodySchema,
  validationErrorSchema,
} from "../openapi/schemas.js";

export function registerInventoryRoutes(
  app: FastifyInstance,
  deps: {
    createProduct: CreateProductUseCase;
    listProducts: ListProductsUseCase;
    getProduct: GetProductUseCase;
    updateProduct: UpdateProductUseCase;
    softDeleteProduct: SoftDeleteProductUseCase;
    restoreProduct: RestoreProductUseCase;
    registerStockMovement: RegisterStockMovementUseCase;
    listStockMovements: ListStockMovementsUseCase;
  },
  authenticate: preHandlerHookHandler,
): void {
  const requireStaff = createRequireRoles(Role.ADMIN, Role.BARBER);
  const pre = [authenticate, requireStaff];

  app.post(
    "/inventory/products",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Criar produto",
        description: "ADMIN ou BARBER. SKU único.",
        security: [{ bearerAuth: [] }],
        body: createProductBodySchema,
        response: {
          201: { description: "Produto criado", ...createProductResponseSchema },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          409: { ...errorSchema, description: "SKU duplicado" },
        },
      },
    },
    async (request, reply) => {
      const body = createProductSchema.parse(request.body);
      const r = request.requester!;
      const result = await deps.createProduct.execute(r, body);
      void reply.status(201).send(result);
    },
  );

  app.get(
    "/inventory/products",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Listar produtos",
        security: [{ bearerAuth: [] }],
        querystring: listProductsQueryOpenApiSchema,
        response: {
          200: { type: "array", items: productRowSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const query = listProductsQuerySchema.parse(request.query);
      const r = request.requester!;
      const rows = await deps.listProducts.execute(r, query);
      void reply.send(rows);
    },
  );

  app.get(
    "/inventory/products/:id",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Obter produto por ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        querystring: includeDeletedQuerySchema,
        response: {
          200: productRowSchema,
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const includeDeleted = (request.query as { includeDeleted?: string }).includeDeleted === "true";
      const r = request.requester!;
      const row = await deps.getProduct.execute(r, id, includeDeleted);
      void reply.send(row);
    },
  );

  app.patch(
    "/inventory/products/:id",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Atualizar produto",
        description: "Não altera a quantidade — use movimentações para isso.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: updateProductBodySchema,
        response: {
          204: { description: "Atualizado" },
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
          409: { ...errorSchema, description: "SKU duplicado" },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateProductSchema.parse(request.body);
      const r = request.requester!;
      await deps.updateProduct.execute(r, id, body);
      void reply.status(204).send();
    },
  );

  app.delete(
    "/inventory/products/:id",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Apagar produto (soft delete)",
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
      await deps.softDeleteProduct.execute(r, id);
      void reply.status(204).send();
    },
  );

  app.post(
    "/inventory/products/:id/restore",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Restaurar produto",
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
      await deps.restoreProduct.execute(r, id);
      void reply.status(204).send();
    },
  );

  app.post(
    "/inventory/products/:id/movements",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Registrar movimentação de estoque",
        description:
          "IN: soma. OUT: subtrai (falha se estoque insuficiente). ADJUSTMENT: define o estoque com o valor enviado.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: stockMovementBodySchema,
        response: {
          201: stockMovementRowSchema,
          400: { ...validationErrorSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
          404: { ...errorSchema },
          409: { ...errorSchema, description: "Estoque insuficiente (OUT)" },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = stockMovementSchema.parse(request.body);
      const r = request.requester!;
      const result = await deps.registerStockMovement.execute(r, id, body);
      void reply.status(201).send(result);
    },
  );

  app.get(
    "/inventory/movements",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Listar movimentações",
        security: [{ bearerAuth: [] }],
        querystring: listMovementsQueryOpenApiSchema,
        response: {
          200: { type: "array", items: stockMovementRowSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const query = listMovementsQuerySchema.parse(request.query);
      const r = request.requester!;
      const rows = await deps.listStockMovements.execute(r, query);
      void reply.send(rows);
    },
  );

  app.get(
    "/inventory/products/:id/movements",
    {
      preHandler: pre,
      schema: {
        tags: ["inventory"],
        summary: "Histórico de movimentações de um produto",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: {
          200: { type: "array", items: stockMovementRowSchema },
          401: { ...errorSchema },
          403: { ...errorSchema },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const r = request.requester!;
      const rows = await deps.listStockMovements.execute(r, { productId: id });
      void reply.send(rows);
    },
  );
}
