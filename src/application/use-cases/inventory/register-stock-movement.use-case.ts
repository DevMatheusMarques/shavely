import { randomUUID } from "node:crypto";
import { StockMovement } from "../../../domain/entities/stock-movement.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { StockMovementType } from "../../../domain/value-objects/stock-movement-type.js";
import type { StockMovementInput } from "../../dto/inventory.dto.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { UnitOfWorkPort } from "../../ports/unit-of-work.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export interface StockMovementResult {
  movementId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  quantityAfter: number;
  reason: string | null;
  performedByUserId: string | null;
  createdAt: string;
}

export class RegisterStockMovementUseCase {
  constructor(
    private readonly uow: UnitOfWorkPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    requester: Requester,
    productId: string,
    input: StockMovementInput,
  ): Promise<StockMovementResult> {
    assertCanManageInventory(requester);
    const now = this.clock.now();
    const movementId = randomUUID();

    return this.uow.runInventoryTransaction(async ({ products, movements }) => {
      const product = await products.findById(productId);
      if (!product) {
        throw new DomainError("Produto não encontrado", "NOT_FOUND", 404);
      }
      let quantityDelta: number;
      let quantityAfter: number;
      if (input.type === StockMovementType.IN) {
        product.applyIncrement(input.quantity, now);
        quantityDelta = input.quantity;
        quantityAfter = product.quantity;
      } else if (input.type === StockMovementType.OUT) {
        product.applyDecrement(input.quantity, now);
        quantityDelta = -input.quantity;
        quantityAfter = product.quantity;
      } else {
        const before = product.quantity;
        product.applyAdjustment(input.quantity, now);
        quantityDelta = product.quantity - before;
        quantityAfter = product.quantity;
      }
      await products.save(product);
      const movement = new StockMovement({
        id: movementId,
        productId: product.id,
        type: input.type,
        quantity: quantityDelta,
        quantityAfter,
        reason: input.reason ?? null,
        performedByUserId: requester.userId,
        createdAt: now,
      });
      await movements.save(movement);
      return {
        movementId,
        productId: product.id,
        type: input.type,
        quantity: quantityDelta,
        quantityAfter,
        reason: movement.reason,
        performedByUserId: movement.performedByUserId,
        createdAt: now.toISOString(),
      };
    });
  }
}
