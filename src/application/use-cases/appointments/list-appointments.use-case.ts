import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { Appointment } from "../../../domain/entities/appointment.js";
import type { AppointmentListFilters, AppointmentRepositoryPort } from "../../ports/appointment-repository.port.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { Requester } from "../../types/requester.js";
import type { ListAppointmentsQuery } from "../../dto/appointment.dto.js";

export class ListAppointmentsUseCase {
  constructor(
    private readonly appointments: AppointmentRepositoryPort,
    private readonly barbers: BarberRepositoryPort,
  ) {}

  async execute(requester: Requester, query: ListAppointmentsQuery): Promise<Appointment[]> {
    const filters: AppointmentListFilters = {};
    if (query.from) {
      filters.from = new Date(query.from);
    }
    if (query.to) {
      filters.to = new Date(query.to);
    }
    if (requester.role === Role.ADMIN) {
      if (query.barberId) {
        filters.barberId = query.barberId;
      }
      if (query.clientId) {
        filters.clientId = query.clientId;
      }
      if (query.includeDeleted === true) {
        filters.includeDeleted = true;
      }
      return this.appointments.list(filters);
    }
    if (requester.role === Role.CLIENT) {
      filters.clientId = requester.userId;
      return this.appointments.list(filters);
    }
    if (requester.role === Role.BARBER) {
      const barber = await this.barbers.findByUserId(requester.userId);
      if (!barber) {
        throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
      }
      filters.barberId = barber.id;
      return this.appointments.list(filters);
    }
    throw new DomainError("Papel inválido", "INVALID_ROLE", 403);
  }
}
