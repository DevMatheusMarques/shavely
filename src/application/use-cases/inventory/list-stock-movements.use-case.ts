import type { ListMovementsQuery } from "../../dto/inventory.dto.js";
import type { StockMovementRepositoryPort } from "../../ports/stock-movement-repository.port.js";
import { assertCanManageInventory } from "../../services/inventory-access.js";
import type { Requester } from "../../types/requester.js";

export interface StockMovementView {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  quantityAfter: number;
  reason: string | null;
  performedByUserId: string | null;
  createdAt: string;
}

export class ListStockMovementsUseCase {
  constructor(private readonly movements: StockMovementRepositoryPort) {}

  async execute(requester: Requester, query: ListMovementsQuery): Promise<StockMovementView[]> {
    assertCanManageInventory(requester);
    const rows = await this.movements.list({
      productId: query.productId,
      type: query.type,
      from: query.from,
      to: query.to,
    });
    return rows.map((m) => ({
      id: m.id,
      productId: m.productId,
      type: m.type,
      quantity: m.quantity,
      quantityAfter: m.quantityAfter,
      reason: m.reason,
      performedByUserId: m.performedByUserId,
      createdAt: m.createdAt.toISOString(),
    }));
  }
}
