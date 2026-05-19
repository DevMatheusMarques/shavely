import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "barbers" })
export class BarberOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36, unique: true })
  userId!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 3 })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", precision: 3 })
  deletedAt!: Date | null;
}
