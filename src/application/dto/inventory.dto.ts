import { z } from "zod";
import { StockMovementType } from "../../domain/value-objects/stock-movement-type.js";

export const skuSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9._-]+$/u, "SKU pode conter apenas letras, números, ponto, hífen ou sublinhado");

export const createProductSchema = z.object({
  sku: skuSchema,
  name: z.string().min(2).max(160),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  unit: z.string().min(1).max(16),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  costCents: z.number().int().min(0).default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  sku: skuSchema.optional(),
  name: z.string().min(2).max(160).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  unit: z.string().min(1).max(16).optional(),
  minQuantity: z.number().int().min(0).optional(),
  costCents: z.number().int().min(0).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const listProductsQuerySchema = z.object({
  search: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(80).optional(),
  lowStock: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  includeDeleted: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const stockMovementSchema = z
  .object({
    type: z.nativeEnum(StockMovementType),
    quantity: z.number().int(),
    reason: z.string().min(1).max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === StockMovementType.ADJUSTMENT) {
      if (data.quantity < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Para ADJUSTMENT a quantidade deve ser >= 0 (valor alvo do estoque)",
          path: ["quantity"],
        });
      }
    } else if (data.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantidade deve ser maior que zero",
        path: ["quantity"],
      });
    }
  });

export type StockMovementInput = z.infer<typeof stockMovementSchema>;

export const listMovementsQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  type: z.nativeEnum(StockMovementType).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ListMovementsQuery = z.infer<typeof listMovementsQuerySchema>;
