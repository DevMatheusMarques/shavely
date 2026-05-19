import type { ListProductsQuery } from "../../dto/inventory.dto.js";
import type { ProductRepositoryPort } from "../../ports/product-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export interface ProductView {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  quantity: number;
  minQuantity: number;
  costCents: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepositoryPort) {}

  async execute(requester: Requester, query: ListProductsQuery): Promise<ProductView[]> {
    assertCanManageInventory(requester);
    const rows = await this.products.listWithMeta({
      search: query.search,
      category: query.category,
      lowStock: query.lowStock,
      includeDeleted: query.includeDeleted,
    });
    return rows.map(({ product, deletedAt }) => ({
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
    }));
  }
}
