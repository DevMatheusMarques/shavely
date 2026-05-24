import type { Service } from "../../domain/entities/service.js";

export interface BarberServiceAssignmentMeta {
  assignmentId: string;
  barberId: string;
  serviceId: string;
  assignedAt: Date;
  deletedAt: Date | null;
}

export interface BarberServiceRepositoryPort {
  assign(barberId: string, serviceId: string, id: string, at: Date): Promise<void>;
  /** Soft delete da associação barbeiro ↔ serviço. */
  unassign(barberId: string, serviceId: string): Promise<void>;
  restoreAssignment(barberId: string, serviceId: string): Promise<void>;
  isAssigned(barberId: string, serviceId: string, includeUnassigned?: boolean): Promise<boolean>;
  listServicesByBarber(barberId: string, includeDeletedLinks?: boolean): Promise<Service[]>;
  listServicesByBarberWithMeta(
    barberId: string,
    includeDeletedLinks?: boolean,
  ): Promise<Array<{ service: Service; linkDeletedAt: Date | null }>>;
  listBarberIdsByService(serviceId: string, includeDeletedLinks?: boolean): Promise<string[]>;
  findAssignment(
    barberId: string,
    serviceId: string,
    includeDeleted?: boolean,
  ): Promise<BarberServiceAssignmentMeta | null>;
}
