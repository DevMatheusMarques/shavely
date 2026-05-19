import type { StockMovement } from "../../domain/entities/stock-movement.js";
import type { StockMovementType } from "../../domain/value-objects/stock-movement-type.js";

export interface StockMovementListFilters {
  productId?: string;
  type?: StockMovementType;
  from?: Date;
  to?: Date;
}

export interface StockMovementRepositoryPort {
  save(movement: StockMovement): Promise<void>;
  list(filters: StockMovementListFilters): Promise<StockMovement[]>;
}
