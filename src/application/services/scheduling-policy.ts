import type { BarberAvailability } from "../../domain/entities/barber-availability.js";
import { DomainError } from "../../domain/errors/domain-error.js";

export function assertWithinAvailability(
  startsAt: Date,
  endsAt: Date,
  availability: BarberAvailability[],
): void {
  if (startsAt >= endsAt) {
    throw new DomainError("Horário inválido: fim deve ser após o início", "INVALID_SLOT");
  }
  const ok = availability.some((slot) => slot.coversInterval(startsAt, endsAt));
  if (!ok) {
    throw new DomainError("Horário fora da disponibilidade do barbeiro", "OUTSIDE_AVAILABILITY");
  }
}
