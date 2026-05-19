import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "stock_movements" })
@Index("IDX_stock_movements_product", ["productId", "createdAt"])
export class StockMovementOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "product_id", type: "char", length: 36 })
  productId!: string;

  @Column({ type: "varchar", length: 16 })
  type!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ name: "quantity_after", type: "int" })
  quantityAfter!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  reason!: string | null;

  @Column({ name: "performed_by_user_id", type: "char", length: 36, nullable: true })
  performedByUserId!: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 3 })
  createdAt!: Date;
}
