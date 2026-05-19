import { DomainError } from "../../../domain/errors/domain-error.js";
import type { ProductRepositoryPort } from "../../ports/product-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export class SoftDeleteProductUseCase {
  constructor(private readonly products: ProductRepositoryPort) {}

  async execute(requester: Requester, productId: string): Promise<void> {
    assertCanManageInventory(requester);
    const existing = await this.products.findById(productId);
    if (!existing) {
      throw new DomainError("Produto não encontrado", "NOT_FOUND", 404);
    }
    await this.products.softDelete(productId);
  }
}
