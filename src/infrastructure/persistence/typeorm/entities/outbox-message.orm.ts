import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "outbox_messages" })
@Index(["publishedAt"])
export class OutboxMessageOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "event_id", type: "char", length: 36, unique: true })
  eventId!: string;

  @Column({ name: "routing_key", type: "varchar", length: 128 })
  routingKey!: string;

  @Column({ type: "text" })
  payload!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 3 })
  createdAt!: Date;

  @Column({ name: "published_at", type: "datetime", precision: 3, nullable: true })
  publishedAt!: Date | null;
}
