import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "users" })
export class UserOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "varchar", length: 16 })
  role!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "phone_e164", type: "varchar", length: 20, nullable: true })
  phoneE164!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp", precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", precision: 3 })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", precision: 3 })
  deletedAt!: Date | null;
}
