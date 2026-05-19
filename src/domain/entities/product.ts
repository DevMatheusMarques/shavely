import { DomainError } from "../errors/domain-error.js";

export interface ProductProps {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  quantity: number;
  minQuantity: number;
  costCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }
  get sku(): string {
    return this.props.sku;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | null {
    return this.props.description;
  }
  get category(): string | null {
    return this.props.category;
  }
  get unit(): string {
    return this.props.unit;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get minQuantity(): number {
    return this.props.minQuantity;
  }
  get costCents(): number {
    return this.props.costCents;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isLowStock(): boolean {
    return this.props.quantity <= this.props.minQuantity;
  }

  applyIncrement(amount: number, now: Date): void {
    if (amount <= 0) {
      throw new DomainError("Quantidade deve ser maior que zero", "INVALID_QUANTITY");
    }
    this.props = {
      ...this.props,
      quantity: this.props.quantity + amount,
      updatedAt: now,
    };
  }

  applyDecrement(amount: number, now: Date): void {
    if (amount <= 0) {
      throw new DomainError("Quantidade deve ser maior que zero", "INVALID_QUANTITY");
    }
    if (this.props.quantity - amount < 0) {
      throw new DomainError(
        "Estoque insuficiente para esta operação",
        "INSUFFICIENT_STOCK",
        409,
      );
    }
    this.props = {
      ...this.props,
      quantity: this.props.quantity - amount,
      updatedAt: now,
    };
  }

  applyAdjustment(target: number, now: Date): void {
    if (target < 0) {
      throw new DomainError("Quantidade alvo não pode ser negativa", "INVALID_QUANTITY");
    }
    this.props = {
      ...this.props,
      quantity: target,
      updatedAt: now,
    };
  }

  toProps(): ProductProps {
    return { ...this.props };
  }
}
