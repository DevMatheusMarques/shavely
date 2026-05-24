import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "appointments" })
@Index(["barberId", "startsAt"])
@Index(["clientId", "startsAt"])
export class AppointmentOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "client_id", type: "char", length: 36 })
  clientId!: string;

  @Column({ name: "barber_id", type: "char", length: 36 })
  barberId!: string;

  @Column({ name: "service_id", type: "char", length: 36 })
  serviceId!: string;

  @Column({ name: "starts_at", type: "timestamp", precision: 3 })
  startsAt!: Date;

  @Column({ name: "ends_at", type: "timestamp", precision: 3 })
  endsAt!: Date;

  @Column({ type: "varchar", length: 32 })
  status!: string;

  @Column({ name: "reminder_sent_at", type: "timestamp", precision: 3, nullable: true })
  reminderSentAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp", precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", precision: 3 })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", precision: 3 })
  deletedAt!: Date | null;
}
