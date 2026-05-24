import type { Repository } from "typeorm";
import type {
  ServiceListFilters,
  ServiceRepositoryPort,
  ServiceWithDeletionMeta,
} from "../../../../application/ports/service-repository.port.js";
import { Service } from "../../../../domain/entities/service.js";
import { serviceToDomain, serviceToOrm } from "../../mappers/service.mapper.js";
import type { ServiceOrm } from "../entities/service.orm.js";

export class TypeormServiceRepository implements ServiceRepositoryPort {
  constructor(private readonly repo: Repository<ServiceOrm>) {}

  async save(service: Service): Promise<void> {
    await this.repo.save(serviceToOrm(service));
  }

  async findById(id: string, includeDeleted = false): Promise<Service | null> {
    const row = await this.repo.findOne({ where: { id }, withDeleted: includeDeleted });
    return row ? serviceToDomain(row) : null;
  }

  async findByIdWithMeta(id: string, includeDeleted = false): Promise<ServiceWithDeletionMeta | null> {
    const row = await this.repo.findOne({ where: { id }, withDeleted: includeDeleted });
    if (!row) {
      return null;
    }
    return { service: serviceToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async list(filters?: ServiceListFilters): Promise<Service[]> {
    const rows = await this.repo.find({
      order: { name: "ASC" },
      withDeleted: filters?.includeDeleted === true,
    });
    return rows.map(serviceToDomain);
  }

  async listWithMeta(filters?: ServiceListFilters): Promise<ServiceWithDeletionMeta[]> {
    const rows = await this.repo.find({
      order: { name: "ASC" },
      withDeleted: filters?.includeDeleted === true,
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
