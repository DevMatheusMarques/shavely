import { DomainError } from "../errors/domain-error.js";
import { AppointmentStatus } from "../value-objects/appointment-status.js";

export interface AppointmentProps {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Appointment {
  constructor(private props: AppointmentProps) {}

  get id(): string {
    return this.props.id;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get barberId(): string {
    return this.props.barberId;
  }
  get serviceId(): string {
    return this.props.serviceId;
  }
  get startsAt(): Date {
    return this.props.startsAt;
  }
  get endsAt(): Date {
    return this.props.endsAt;
  }
  get status(): AppointmentStatus {
    return this.props.status;
  }

  cancel(now: Date, minimumLeadHours: number): void {
    if (this.props.status === AppointmentStatus.CANCELLED) {
      throw new DomainError("Agendamento já cancelado", "APPOINTMENT_ALREADY_CANCELLED");
    }
    const diffMs = this.props.startsAt.getTime() - now.getTime();
    const minMs = minimumLeadHours * 60 * 60 * 1000;
    if (diffMs < minMs) {
      throw new DomainError(
        `Cancelamento exige antecedência mínima de ${minimumLeadHours} horas`,
        "CANCELLATION_POLICY_VIOLATION",
      );
    }
    this.props = {
      ...this.props,
      status: AppointmentStatus.CANCELLED,
      updatedAt: now,
    };
  }

  reschedule(input: { startsAt: Date; endsAt: Date; serviceId: string }, now: Date): void {
    if (this.props.status !== AppointmentStatus.SCHEDULED) {
      throw new DomainError("Apenas agendamentos ativos podem ser reagendados", "APPOINTMENT_NOT_SCHEDULED");
    }
    this.props = {
      ...this.props,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      serviceId: input.serviceId,
      updatedAt: now,
    };
  }

  toProps(): AppointmentProps {
    return { ...this.props };
  }
}
