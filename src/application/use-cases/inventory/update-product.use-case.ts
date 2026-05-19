import { Product } from "../../../domain/entities/product.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import type { UpdateProductInput } from "../../dto/inventory.dto.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ProductRepositoryPort } from "../../ports/product-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export class UpdateProductUseCase {
  constructor(
    private readonly products: ProductRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(requester: Requester, productId: string, input: UpdateProductInput): Promise<void> {
    assertCanManageInventory(requester);
    if (
      input.sku === undefined &&
      input.name === undefined &&
      input.description === undefined &&
      input.category === undefined &&
      input.unit === undefined &&
      input.minQuantity === undefined &&
      input.costCents === undefined
    ) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const existing = await this.products.findById(productId);
    if (!existing) {
      throw new DomainError("Produto não encontrado", "NOT_FOUND", 404);
    }
    if (input.sku && input.sku !== existing.sku) {
      const other = await this.products.findBySku(input.sku);
      if (other && other.id !== existing.id) {
        throw new DomainError("SKU já em uso por outro produto", "SKU_IN_USE", 409);
      }
    }
    const p = existing.toProps();
    const updated = new Product({
      ...p,
      sku: input.sku ?? p.sku,
      name: input.name ?? p.name,
      description: input.description !== undefined ? input.description : p.description,
      category: input.category !== undefined ? input.category : p.category,
      unit: input.unit ?? p.unit,
      minQuantity: input.minQuantity ?? p.minQuantity,
      costCents: input.costCents ?? p.costCents,
      updatedAt: this.clock.now(),
    });
    await this.products.save(updated);
  }
}
