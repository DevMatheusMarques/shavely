import type { StockMovementType } from "../value-objects/stock-movement-type.js";

export interface StockMovementProps {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  quantityAfter: number;
  reason: string | null;
  performedByUserId: string | null;
  createdAt: Date;
}

export class StockMovement {
  constructor(private readonly props: StockMovementProps) {}

  get id(): string {
    return this.props.id;
  }
  get productId(): string {
    return this.props.productId;
  }
  get type(): StockMovementType {
    return this.props.type;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get quantityAfter(): number {
    return this.props.quantityAfter;
  }
  get reason(): string | null {
    return this.props.reason;
  }
  get performedByUserId(): string | null {
    return this.props.performedByUserId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  toProps(): StockMovementProps {
    return { ...this.props };
  }
}
