import { randomUUID } from "node:crypto";
import { Appointment } from "../../../domain/entities/appointment.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { AppointmentStatus } from "../../../domain/value-objects/appointment-status.js";
import type { CreateAppointmentInput } from "../../dto/appointment.dto.js";
import { assertWithinAvailability } from "../../services/scheduling-policy.js";
import type { AppointmentRepositoryPort } from "../../ports/appointment-repository.port.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { BarberServiceRepositoryPort } from "../../ports/barber-service-repository.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";
import type { UnitOfWorkPort } from "../../ports/unit-of-work.port.js";
import type { Requester } from "../../types/requester.js";
import { EVENT_VERSION, ROUTING_KEYS, type AppointmentCreatedEvent } from "../../../shared/events/index.js";
import { buildAppointmentCreatedWhatsappLink } from "../../../shared/notifications/whatsapp-links.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly barberServices: BarberServiceRepositoryPort,
    private readonly users: UserRepositoryPort,
    private readonly uow: UnitOfWorkPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    requester: Requester,
    input: CreateAppointmentInput,
  ): Promise<{ appointmentId: string; whatsappLink: string | null }> {
    if (requester.role !== "CLIENT") {
      throw new DomainError("Apenas clientes podem criar agendamentos", "FORBIDDEN", 403);
    }
    const startsAt = new Date(input.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new DomainError("Data inválida", "INVALID_DATE");
    }
    const barber = await this.barbers.findById(input.barberId);
    if (!barber) {
      throw new DomainError("Barbeiro não encontrado", "BARBER_NOT_FOUND", 404);
    }
    const service = await this.services.findById(input.serviceId);
    if (!service) {
      throw new DomainError("Serviço não encontrado", "SERVICE_NOT_FOUND", 404);
    }
    const assigned = await this.barberServices.isAssigned(input.barberId, input.serviceId);
    if (!assigned) {
      throw new DomainError("Este barbeiro não presta o serviço seleccionado", "SERVICE_NOT_OFFERED", 404);
    }
    const availability = await this.barbers.listAvailability(input.barberId);
    if (availability.length === 0) {
      throw new DomainError("Barbeiro sem horários cadastrados", "NO_AVAILABILITY");
    }
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);
    assertWithinAvailability(startsAt, endsAt, availability);
    const overlap = await this.appointments.hasOverlap(input.barberId, startsAt, endsAt);
    if (overlap) {
      throw new DomainError("Horário indisponível (conflito)", "DOUBLE_BOOKING", 409);
    }
    const now = this.clock.now();
    const appointmentId = randomUUID();
    const eventId = randomUUID();
    const appointment = new Appointment({
      id: appointmentId,
      clientId: requester.userId,
      barberId: input.barberId,
      serviceId: input.serviceId,
      startsAt,
      endsAt,
      status: AppointmentStatus.SCHEDULED,
      createdAt: now,
      updatedAt: now,
    });
    const event: AppointmentCreatedEvent = {
      event: "appointment.created",
      data: {
        appointmentId,
        clientId: requester.userId,
        barberId: input.barberId,
        serviceId: input.serviceId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
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
        routingKey: ROUTING_KEYS.CREATED,
        payload: JSON.stringify(event),
        createdAt: now,
      });
    });
    const barberAccount = await this.users.findById(barber.userId);
    const clientAccount = await this.users.findById(requester.userId);
    const whatsappLink =
      barberAccount?.phoneE164 && clientAccount
        ? buildAppointmentCreatedWhatsappLink({
            barberPhoneE164: barberAccount.phoneE164,
            clientName: clientAccount.name,
            startsAtIso: startsAt.toISOString(),
          })
        : null;
    return { appointmentId, whatsappLink };
  }
}
