import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "services" })
export class ServiceOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "duration_minutes", type: "int" })
  durationMinutes!: number;

  @Column({ name: "price_cents", type: "int" })
  priceCents!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp", precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", precision: 3 })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", precision: 3 })
  deletedAt!: Date | null;
}
