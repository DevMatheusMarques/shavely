import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import { assertCanModifyAppointment } from "../../services/appointment-access.js";
import { assertWithinAvailability } from "../../services/scheduling-policy.js";
import type { UpdateAppointmentInput } from "../../dto/appointment.dto.js";
import type { AppointmentRepositoryPort } from "../../ports/appointment-repository.port.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { ClockPort } from "../../ports/clock.port.js";
import type { ServiceRepositoryPort } from "../../ports/service-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
    private readonly services: ServiceRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(requester: Requester, appointmentId: string, input: UpdateAppointmentInput): Promise<void> {
    if (input.startsAt === undefined && input.serviceId === undefined) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const appointment = await this.appointments.findById(appointmentId);
    if (!appointment) {
      throw new DomainError("Agendamento não encontrado", "NOT_FOUND", 404);
    }
    await assertCanModifyAppointment(requester, appointment, this.barbers);
    const nextServiceId = input.serviceId ?? appointment.serviceId;
    const startsAt = input.startsAt !== undefined ? new Date(input.startsAt) : appointment.startsAt;
    if (Number.isNaN(startsAt.getTime())) {
      throw new DomainError("Data inválida", "INVALID_DATE");
    }
    const service = await this.services.findByIdAndBarber(nextServiceId, appointment.barberId);
    if (!service) {
      throw new DomainError("Serviço não encontrado para este barbeiro", "SERVICE_NOT_FOUND", 404);
    }
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);
    const availability = await this.barbers.listAvailability(appointment.barberId);
    if (availability.length === 0) {
      throw new DomainError("Barbeiro sem horários cadastrados", "NO_AVAILABILITY");
    }
    assertWithinAvailability(startsAt, endsAt, availability);
    const overlap = await this.appointments.hasOverlap(appointment.barberId, startsAt, endsAt, appointmentId);
    if (overlap) {
      throw new DomainError("Horário indisponível (conflito)", "DOUBLE_BOOKING", 409);
    }
    const now = this.clock.now();
    appointment.reschedule({ startsAt, endsAt, serviceId: nextServiceId }, now);
    await this.appointments.save(appointment);
  }
}

export class SoftDeleteAppointmentAdminUseCase {
  constructor(private readonly appointments: AppointmentRepositoryPort) {}

  async execute(requester: Requester, appointmentId: string): Promise<void> {
    if (requester.role !== Role.ADMIN) {
      throw new DomainError("Apenas administradores podem apagar agendamentos", "FORBIDDEN", 403);
    }
    const existing = await this.appointments.findById(appointmentId);
    if (!existing) {
      throw new DomainError("Agendamento não encontrado", "NOT_FOUND", 404);
    }
    await this.appointments.softDelete(appointmentId);
  }
}

export class RestoreAppointmentAdminUseCase {
  constructor(private readonly appointments: AppointmentRepositoryPort) {}

  async execute(requester: Requester, appointmentId: string): Promise<void> {
    if (requester.role !== Role.ADMIN) {
      throw new DomainError("Apenas administradores podem restaurar agendamentos", "FORBIDDEN", 403);
    }
    const meta = await this.appointments.findByIdWithMeta(appointmentId, true);
    if (!meta) {
      throw new DomainError("Agendamento não encontrado", "NOT_FOUND", 404);
    }
    if (!meta.deletedAt) {
      throw new DomainError("Agendamento não está apagado", "NOT_DELETED", 400);
    }
    await this.appointments.restore(appointmentId);
  }
}
