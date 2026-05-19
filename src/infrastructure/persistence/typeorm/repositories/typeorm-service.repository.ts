import type { Repository } from "typeorm";
import type { ServiceRepositoryPort, ServiceWithDeletionMeta } from "../../../../application/ports/service-repository.port.js";
import { Service } from "../../../../domain/entities/service.js";
import { serviceToDomain, serviceToOrm } from "../../mappers/service.mapper.js";
import type { ServiceOrm } from "../entities/service.orm.js";

export class TypeormServiceRepository implements ServiceRepositoryPort {
  constructor(private readonly repo: Repository<ServiceOrm>) {}

  async save(service: Service): Promise<void> {
    await this.repo.save(serviceToOrm(service));
  }

  async findByIdAndBarber(
    serviceId: string,
    barberId: string,
    includeDeleted = false,
  ): Promise<Service | null> {
    const row = await this.repo.findOne({
      where: { id: serviceId, barberId },
      withDeleted: includeDeleted,
    });
    return row ? serviceToDomain(row) : null;
  }

  async findByIdAndBarberWithMeta(
    serviceId: string,
    barberId: string,
    includeDeleted = false,
  ): Promise<ServiceWithDeletionMeta | null> {
    const row = await this.repo.findOne({
      where: { id: serviceId, barberId },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return { service: serviceToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async listByBarber(barberId: string, includeDeleted = false): Promise<Service[]> {
    const rows = await this.repo.find({
      where: { barberId },
      order: { name: "ASC" },
      withDeleted: includeDeleted,
    });
    return rows.map(serviceToDomain);
  }

  async listByBarberWithMeta(barberId: string, includeDeleted = false): Promise<ServiceWithDeletionMeta[]> {
    const rows = await this.repo.find({
      where: { barberId },
      order: { name: "ASC" },
      withDeleted: includeDeleted,
    });
    return rows.map((row) => ({
      service: serviceToDomain(row),
      deletedAt: row.deletedAt ?? null,
    }));
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore({ id });
  }
}
