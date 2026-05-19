import { Barber } from "../../../domain/entities/barber.js";
import { BarberAvailability } from "../../../domain/entities/barber-availability.js";
import { BarberAvailabilityOrm } from "../typeorm/entities/barber-availability.orm.js";
import { BarberOrm } from "../typeorm/entities/barber.orm.js";

export function barberToDomain(row: BarberOrm): Barber {
  return new Barber({
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function barberToOrm(barber: Barber): BarberOrm {
  const p = barber.toProps();
  const row = new BarberOrm();
  row.id = p.id;
  row.userId = p.userId;
  row.createdAt = p.createdAt;
  row.updatedAt = p.updatedAt;
  return row;
}

export function availabilityToDomain(row: BarberAvailabilityOrm): BarberAvailability {
  return new BarberAvailability({
    id: row.id,
    barberId: row.barberId,
    weekday: row.weekday,
    startMinutes: row.startMinutes,
    endMinutes: row.endMinutes,
  });
}

export function availabilityToOrm(r: BarberAvailability): BarberAvailabilityOrm {
  const e = new BarberAvailabilityOrm();
  e.id = r.id;
  e.barberId = r.barberId;
  e.weekday = r.weekday;
  e.startMinutes = r.startMinutes;
  e.endMinutes = r.endMinutes;
  return e;
}
