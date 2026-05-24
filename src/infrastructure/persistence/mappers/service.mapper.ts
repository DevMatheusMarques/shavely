import { Service } from "../../../domain/entities/service.js";
import { ServiceOrm } from "../typeorm/entities/service.orm.js";

export function serviceToDomain(row: ServiceOrm): Service {
  return new Service({
    id: row.id,
    name: row.name,
    durationMinutes: row.durationMinutes,
    priceCents: row.priceCents,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function serviceToOrm(service: Service): ServiceOrm {
  const p = service.toProps();
  const row = new ServiceOrm();
  row.id = p.id;
  row.name = p.name;
  row.durationMinutes = p.durationMinutes;
  row.priceCents = p.priceCents;
  row.createdAt = p.createdAt;
  row.updatedAt = p.updatedAt;
  return row;
}
