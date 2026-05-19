import { randomUUID } from "node:crypto";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { AppointmentRepositoryPort } from "../../ports/appointment-repository.port.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { UnitOfWorkPort } from "../../ports/unit-of-work.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";
import type { Requester } from "../../types/requester.js";
import { EVENT_VERSION, ROUTING_KEYS, type AppointmentCancelledEvent } from "../../../shared/events/index.js";
import { buildAppointmentCancelledWhatsappLink } from "../../../shared/notifications/whatsapp-links.js";

const MIN_CANCEL_HOURS = 2;

export class CancelAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
    private readonly uow: UnitOfWorkPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    requester: Requester,
    appointmentId: string,
  ): Promise<{ whatsappLink: string | null }> {
    const appointment = await this.appointments.findById(appointmentId);
    if (!appointment) {
      throw new DomainError("Agendamento não encontrado", "NOT_FOUND", 404);
    }
    await this.assertCanManage(requester, appointment.clientId, appointment.barberId);
    appointment.cancel(this.clock.now(), MIN_CANCEL_HOURS);
    const now = this.clock.now();
    const eventId = randomUUID();
    const event: AppointmentCancelledEvent = {
      event: "appointment.cancelled",
      data: {
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        barberId: appointment.barberId,
        cancelledAt: now.toISOString(),
        startsAt: appointment.startsAt.toISOString(),
      },
      metadata: {
        timestamp: now.toISOString(),
        version: EVENT_VERSION,
        eventId,
      },
    };
    await this.uow.runInTransaction(async ({ appointments, outbox }) => {
      await appointments.save(appointment);
      await outbox.enqueue({
        id: randomUUID(),
        eventId,
        routingKey: ROUTING_KEYS.CANCELLED,
        payload: JSON.stringify(event),
        createdAt: now,
      });
    });
    const barber = await this.barbers.findById(appointment.barberId);
    const barberUser = barber ? await this.users.findById(barber.userId) : null;
    const clientUser = await this.users.findById(appointment.clientId);
    const whatsappLink =
      barberUser?.phoneE164 && clientUser
        ? buildAppointmentCancelledWhatsappLink({
            barberPhoneE164: barberUser.phoneE164,
            clientName: clientUser.name,
            startsAtIso: appointment.startsAt.toISOString(),
          })
        : null;
    return { whatsappLink };
  }

  private async assertCanManage(
    requester: Requester,
    clientId: string,
    barberId: string,
  ): Promise<void> {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (requester.role === Role.CLIENT && requester.userId === clientId) {
      return;
    }
    if (requester.role === Role.BARBER) {
      const barber = await this.barbers.findByUserId(requester.userId);
      if (barber && barber.id === barberId) {
        return;
      }
    }
    throw new DomainError("Sem permissão para cancelar este agendamento", "FORBIDDEN", 403);
  }
}
