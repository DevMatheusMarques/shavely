import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "barber_services" })
@Index(["barberId", "serviceId"], { unique: true })
@Index(["serviceId"])
export class BarberServiceOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "barber_id", type: "char", length: 36 })
  barberId!: string;

  @Column({ name: "service_id", type: "char", length: 36 })
  serviceId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp", precision: 3 })
  createdAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", precision: 3 })
  deletedAt!: Date | null;
}
