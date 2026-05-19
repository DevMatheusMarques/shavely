import { randomUUID } from "node:crypto";
import { Product } from "../../../domain/entities/product.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import type { CreateProductInput } from "../../dto/inventory.dto.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ProductRepositoryPort } from "../../ports/product-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export class CreateProductUseCase {
  constructor(
    private readonly products: ProductRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(requester: Requester, input: CreateProductInput): Promise<{ productId: string }> {
    assertCanManageInventory(requester);
    const exists = await this.products.existsBySku(input.sku);
    if (exists) {
      throw new DomainError("SKU já existente", "SKU_IN_USE", 409);
    }
    const now = this.clock.now();
    const product = new Product({
      id: randomUUID(),
      sku: input.sku,
      name: input.name,
      description: input.description ?? null,
      category: input.category ?? null,
      unit: input.unit,
      quantity: input.quantity,
      minQuantity: input.minQuantity,
      costCents: input.costCents,
      createdAt: now,
      updatedAt: now,
    });
    await this.products.save(product);
    return { productId: product.id };
  }
}
