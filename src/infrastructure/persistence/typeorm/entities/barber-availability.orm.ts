import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "barber_availability" })
@Index(["barberId", "weekday"])
export class BarberAvailabilityOrm {
  @PrimaryColumn("char", { length: 36 })
  id!: string;

  @Column({ name: "barber_id", type: "char", length: 36 })
  barberId!: string;

  @Column({ type: "smallint" })
  weekday!: number;

  @Column({ name: "start_minutes", type: "smallint" })
  startMinutes!: number;

  @Column({ name: "end_minutes", type: "smallint" })
  endMinutes!: number;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", precision: 3 })
  deletedAt!: Date | null;
}
