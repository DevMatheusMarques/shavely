import type { Service } from "../../domain/entities/service.js";

export interface ServiceListFilters {
  includeDeleted?: boolean;
}

export interface ServiceWithDeletionMeta {
  service: Service;
  deletedAt: Date | null;
}

export interface ServiceRepositoryPort {
  save(service: Service): Promise<void>;
  findById(id: string, includeDeleted?: boolean): Promise<Service | null>;
  findByIdWithMeta(id: string, includeDeleted?: boolean): Promise<ServiceWithDeletionMeta | null>;
  list(filters?: ServiceListFilters): Promise<Service[]>;
  listWithMeta(filters?: ServiceListFilters): Promise<ServiceWithDeletionMeta[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
