import { Appointment } from "../../../domain/entities/appointment.js";
import { AppointmentStatus } from "../../../domain/value-objects/appointment-status.js";
import { AppointmentOrm } from "../typeorm/entities/appointment.orm.js";

export function appointmentToDomain(row: AppointmentOrm): Appointment {
  return new Appointment({
    id: row.id,
    clientId: row.clientId,
    barberId: row.barberId,
    serviceId: row.serviceId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    status: row.status as AppointmentStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function appointmentToOrm(appointment: Appointment): AppointmentOrm {
  const p = appointment.toProps();
  const row = new AppointmentOrm();
  row.id = p.id;
  row.clientId = p.clientId;
  row.barberId = p.barberId;
  row.serviceId = p.serviceId;
  row.startsAt = p.startsAt;
  row.endsAt = p.endsAt;
  row.status = p.status;
  row.createdAt = p.createdAt;
  row.updatedAt = p.updatedAt;
  return row;
}
