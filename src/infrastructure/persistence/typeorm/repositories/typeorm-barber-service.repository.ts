import { In } from "typeorm";
import type { Repository } from "typeorm";
import type {
  BarberServiceAssignmentMeta,
  BarberServiceRepositoryPort,
} from "../../../../application/ports/barber-service-repository.port.js";
import { Service } from "../../../../domain/entities/service.js";
import { serviceToDomain } from "../../mappers/service.mapper.js";
import { BarberServiceOrm } from "../entities/barber-service.orm.js";
import type { ServiceOrm } from "../entities/service.orm.js";

export class TypeormBarberServiceRepository implements BarberServiceRepositoryPort {
  constructor(
    private readonly links: Repository<BarberServiceOrm>,
    private readonly services: Repository<ServiceOrm>,
  ) {}

  async assign(barberId: string, serviceId: string, id: string, at: Date): Promise<void> {
    const existing = await this.links.findOne({
      where: { barberId, serviceId },
      withDeleted: true,
    });
    if (existing) {
      if (existing.deletedAt) {
        await this.links.restore({ barberId, serviceId });
      }
      return;
    }
    const row = new BarberServiceOrm();
    row.id = id;
    row.barberId = barberId;
    row.serviceId = serviceId;
    row.createdAt = at;
    await this.links.insert(row);
  }

  async unassign(barberId: string, serviceId: string): Promise<void> {
    await this.links.softDelete({ barberId, serviceId });
  }

  async restoreAssignment(barberId: string, serviceId: string): Promise<void> {
    await this.links.restore({ barberId, serviceId });
  }

  async isAssigned(barberId: string, serviceId: string): Promise<boolean> {
    const count = await this.links.count({ where: { barberId, serviceId } });
    return count > 0;
  }

  async listServicesByBarber(barberId: string, includeDeletedLinks = false): Promise<Service[]> {
    const rows = await this.listServicesByBarberWithMeta(barberId, includeDeletedLinks);
    return rows.map((r) => r.service);
  }

  async listServicesByBarberWithMeta(
    barberId: string,
    includeDeletedLinks = false,
  ): Promise<Array<{ service: Service; linkDeletedAt: Date | null }>> {
    const linkRows = await this.links.find({
      where: { barberId },
      withDeleted: includeDeletedLinks,
      order: { createdAt: "ASC" },
    });
    if (linkRows.length === 0) {
      return [];
    }
    const serviceIds = [...new Set(linkRows.map((l) => l.serviceId))];
    const serviceRows = await this.services.find({
      where: { id: In(serviceIds) },
      order: { name: "ASC" },
    });
    const serviceById = new Map(serviceRows.map((s) => [s.id, s]));
    const out: Array<{ service: Service; linkDeletedAt: Date | null }> = [];
    for (const link of linkRows) {
      const s = serviceById.get(link.serviceId);
      if (!s) {
        continue;
      }
      out.push({
        service: serviceToDomain(s),
        linkDeletedAt: link.deletedAt ?? null,
      });
    }
    out.sort((a, b) => a.service.name.localeCompare(b.service.name, "pt"));
    return out;
  }

  async listBarberIdsByService(serviceId: string, includeDeletedLinks = false): Promise<string[]> {
    const rows = await this.links.find({
      where: { serviceId },
      withDeleted: includeDeletedLinks,
      order: { createdAt: "ASC" },
    });
    return rows.map((r) => r.barberId);
  }

  async findAssignment(
    barberId: string,
    serviceId: string,
    includeDeleted = false,
  ): Promise<BarberServiceAssignmentMeta | null> {
    const row = await this.links.findOne({
      where: { barberId, serviceId },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return {
      assignmentId: row.id,
      barberId: row.barberId,
      serviceId: row.serviceId,
      assignedAt: row.createdAt,
      deletedAt: row.deletedAt ?? null,
    };
  }
}
