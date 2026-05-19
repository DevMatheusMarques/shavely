import type { Service } from "../../domain/entities/service.js";

export interface ServiceWithDeletionMeta {
  service: Service;
  deletedAt: Date | null;
}

export interface ServiceRepositoryPort {
  findByIdAndBarber(serviceId: string, barberId: string, includeDeleted?: boolean): Promise<Service | null>;
  findByIdAndBarberWithMeta(
    serviceId: string,
    barberId: string,
    includeDeleted?: boolean,
  ): Promise<ServiceWithDeletionMeta | null>;
  listByBarber(barberId: string, includeDeleted?: boolean): Promise<Service[]>;
  listByBarberWithMeta(barberId: string, includeDeleted?: boolean): Promise<ServiceWithDeletionMeta[]>;
  save(service: Service): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
