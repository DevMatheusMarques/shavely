import { DomainError } from "../../../domain/errors/domain-error.js";
import type { ProductRepositoryPort } from "../../ports/product-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export class RestoreProductUseCase {
  constructor(private readonly products: ProductRepositoryPort) {}

  async execute(requester: Requester, productId: string): Promise<void> {
    assertCanManageInventory(requester);
    const meta = await this.products.findByIdWithMeta(productId, true);
    if (!meta) {
      throw new DomainError("Produto não encontrado", "NOT_FOUND", 404);
    }
    if (!meta.deletedAt) {
      throw new DomainError("Produto não está apagado", "NOT_DELETED", 400);
    }
    await this.products.restore(productId);
  }
}
