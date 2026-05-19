import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import { assertCanReadAppointment } from "../../services/appointment-access.js";
import type { AppointmentRepositoryPort } from "../../ports/appointment-repository.port.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class GetAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
  ) {}

  async execute(
    requester: Requester,
    appointmentId: string,
    includeDeleted?: boolean,
  ): Promise<{
    id: string;
    clientId: string;
    barberId: string;
    serviceId: string;
    startsAt: string;
    endsAt: string;
    status: string;
    deletedAt: string | null;
  }> {
    const allowDeleted = includeDeleted === true && requester.role === Role.ADMIN;
    const meta = await this.appointments.findByIdWithMeta(appointmentId, allowDeleted);
    if (!meta) {
      throw new DomainError("Agendamento não encontrado", "NOT_FOUND", 404);
    }
    await assertCanReadAppointment(requester, meta.appointment, this.barbers);
    const a = meta.appointment;
    return {
      id: a.id,
      clientId: a.clientId,
      barberId: a.barberId,
      serviceId: a.serviceId,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      status: a.status,
      deletedAt: meta.deletedAt ? meta.deletedAt.toISOString() : null,
    };
  }
}
