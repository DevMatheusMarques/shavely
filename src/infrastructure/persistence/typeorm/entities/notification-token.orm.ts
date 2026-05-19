import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "notification_tokens" })
@Index(["userId", "token"], { unique: true })
export class NotificationTokenOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 512 })
  token!: string;

  @Column({ type: "varchar", length: 16 })
  platform!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 3 })
  createdAt!: Date;
}
