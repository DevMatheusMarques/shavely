import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "products" })
@Index("IDX_products_deleted_at", ["deletedAt"])
@Index("IDX_products_category", ["category"])
export class ProductOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ type: "varchar", length: 64, unique: true })
  sku!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  category!: string | null;

  @Column({ type: "varchar", length: 16 })
  unit!: string;

  @Column({ type: "int", default: 0 })
  quantity!: number;

  @Column({ name: "min_quantity", type: "int", default: 0 })
  minQuantity!: number;

  @Column({ name: "cost_cents", type: "int", default: 0 })
  costCents!: number;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 3 })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", precision: 3 })
  deletedAt!: Date | null;
}
