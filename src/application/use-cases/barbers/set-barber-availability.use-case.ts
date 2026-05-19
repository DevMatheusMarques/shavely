import { randomUUID } from "node:crypto";
import { BarberAvailability } from "../../../domain/entities/barber-availability.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type { SetAvailabilityInput } from "../../dto/service.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class SetBarberAvailabilityUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(requester: Requester, input: SetAvailabilityInput): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros podem definir disponibilidade", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    for (const slot of input.slots) {
      if (slot.endMinutes <= slot.startMinutes) {
        throw new DomainError("Intervalo inválido na disponibilidade", "INVALID_AVAILABILITY");
      }
    }
    const rows = input.slots.map(
      (s) =>
        new BarberAvailability({
          id: randomUUID(),
          barberId: barber.id,
          weekday: s.weekday,
          startMinutes: s.startMinutes,
          endMinutes: s.endMinutes,
        }),
    );
    await this.barbers.saveAvailability(rows);
  }
}
