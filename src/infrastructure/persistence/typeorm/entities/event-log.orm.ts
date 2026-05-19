import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "event_logs" })
@Index(["eventId", "consumer"], { unique: true })
export class EventLogOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "event_id", type: "char", length: 36 })
  eventId!: string;

  @Column({ name: "routing_key", type: "varchar", length: 128 })
  routingKey!: string;

  @Column({ type: "varchar", length: 64 })
  consumer!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 3 })
  createdAt!: Date;
}
