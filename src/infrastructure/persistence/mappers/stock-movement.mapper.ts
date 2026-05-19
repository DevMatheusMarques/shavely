import { StockMovement } from "../../../domain/entities/stock-movement.js";
import {
  parseStockMovementType,
  type StockMovementType,
} from "../../../domain/value-objects/stock-movement-type.js";
import { StockMovementOrm } from "../typeorm/entities/stock-movement.orm.js";

export function stockMovementToDomain(row: StockMovementOrm): StockMovement {
  return new StockMovement({
    id: row.id,
    productId: row.productId,
    type: parseStockMovementType(row.type),
    quantity: row.quantity,
    quantityAfter: row.quantityAfter,
    reason: row.reason,
    performedByUserId: row.performedByUserId,
    createdAt: row.createdAt,
  });
}

export function stockMovementToOrm(movement: StockMovement): StockMovementOrm {
  const p = movement.toProps();
  const row = new StockMovementOrm();
  row.id = p.id;
  row.productId = p.productId;
  row.type = p.type as StockMovementType;
  row.quantity = p.quantity;
  row.quantityAfter = p.quantityAfter;
  row.reason = p.reason;
  row.performedByUserId = p.performedByUserId;
  row.createdAt = p.createdAt;
  return row;
}
