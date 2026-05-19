import { DomainError } from "../../../domain/errors/domain-error.js";
import type { ProductRepositoryPort } from "../../ports/product-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";
import type { ProductView } from "./list-products.use-case.js";

export class GetProductUseCase {
  constructor(private readonly products: ProductRepositoryPort) {}

  async execute(
    requester: Requester,
    productId: string,
    includeDeleted?: boolean,
  ): Promise<ProductView> {
    assertCanManageInventory(requester);
    const meta = await this.products.findByIdWithMeta(productId, includeDeleted === true);
    if (!meta) {
      throw new DomainError("Produto não encontrado", "NOT_FOUND", 404);
    }
    const { product, deletedAt } = meta;
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      costCents: product.costCents,
      isLowStock: product.isLowStock(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    };
  }
}
