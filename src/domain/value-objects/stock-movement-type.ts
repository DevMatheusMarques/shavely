export enum StockMovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}

export function parseStockMovementType(value: string): StockMovementType {
  if (!Object.values(StockMovementType).includes(value as StockMovementType)) {
    throw new Error(`Invalid stock movement type: ${value}`);
  }
  return value as StockMovementType;
}
