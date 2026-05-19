import type { Appointment } from "../../domain/entities/appointment.js";
import { DomainError } from "../../domain/errors/domain-error.js";
import { Role } from "../../domain/value-objects/role.js";
import type { BarberRepositoryPort } from "../ports/barber-repository.port.js";
import type { Requester } from "../types/requester.js";

export async function assertCanReadAppointment(
  requester: Requester,
  appointment: Appointment,
  barbers: BarberRepositoryPort,
): Promise<void> {
  if (requester.role === Role.ADMIN) {
    return;
  }
  if (requester.role === Role.CLIENT && requester.userId === appointment.clientId) {
    return;
  }
  if (requester.role === Role.BARBER) {
    const barber = await barbers.findByUserId(requester.userId);
    if (barber && barber.id === appointment.barberId) {
      return;
    }
  }
  throw new DomainError("Sem permissão para ver este agendamento", "FORBIDDEN", 403);
}

export async function assertCanModifyAppointment(
  requester: Requester,
  appointment: Appointment,
  barbers: BarberRepositoryPort,
): Promise<void> {
  await assertCanReadAppointment(requester, appointment, barbers);
}
