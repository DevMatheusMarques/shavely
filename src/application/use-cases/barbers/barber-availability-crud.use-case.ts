import { randomUUID } from "node:crypto";
import { BarberAvailability } from "../../../domain/entities/barber-availability.js";
import { DomainError } from "../../../domain/errors/domain-error.js";
import { Role } from "../../../domain/value-objects/role.js";
import type {
  CreateAvailabilitySlotInput,
  UpdateAvailabilitySlotInput,
} from "../../dto/service.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class ListMyAvailabilityUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(
    requester: Requester,
    includeDeleted?: boolean,
  ): Promise<
    Array<{
      id: string;
      barberId: string;
      weekday: number;
      startMinutes: number;
      endMinutes: number;
      deletedAt: string | null;
    }>
  > {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const rows = await this.barbers.listAvailabilityWithMeta(barber.id, includeDeleted === true);
    return rows.map(({ slot, deletedAt }) => ({
      id: slot.id,
      barberId: slot.barberId,
      weekday: slot.weekday,
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    }));
  }
}

export class CreateAvailabilitySlotUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(requester: Requester, input: CreateAvailabilitySlotInput): Promise<{ id: string }> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    if (input.endMinutes <= input.startMinutes) {
      throw new DomainError("Intervalo inválido na disponibilidade", "INVALID_AVAILABILITY");
    }
    const id = randomUUID();
    const slot = new BarberAvailability({
      id,
      barberId: barber.id,
      weekday: input.weekday,
      startMinutes: input.startMinutes,
      endMinutes: input.endMinutes,
    });
    await this.barbers.insertAvailabilitySlot(slot);
    return { id };
  }
}

export class GetAvailabilitySlotUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(
    requester: Requester,
    slotId: string,
    includeDeleted?: boolean,
  ): Promise<{
    id: string;
    barberId: string;
    weekday: number;
    startMinutes: number;
    endMinutes: number;
    deletedAt: string | null;
  }> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const meta = await this.barbers.findAvailabilityByIdWithMeta(slotId, includeDeleted === true);
    if (!meta || meta.slot.barberId !== barber.id) {
      throw new DomainError("Intervalo não encontrado", "NOT_FOUND", 404);
    }
    const { slot, deletedAt } = meta;
    return {
      id: slot.id,
      barberId: slot.barberId,
      weekday: slot.weekday,
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    };
  }
}

export class UpdateAvailabilitySlotUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(requester: Requester, slotId: string, input: UpdateAvailabilitySlotInput): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    if (
      input.weekday === undefined &&
      input.startMinutes === undefined &&
      input.endMinutes === undefined
    ) {
      throw new DomainError("Nenhum campo para atualizar", "EMPTY_UPDATE", 400);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const existing = await this.barbers.findAvailabilityById(slotId);
    if (!existing || existing.barberId !== barber.id) {
      throw new DomainError("Intervalo não encontrado", "NOT_FOUND", 404);
    }
    const weekday = input.weekday ?? existing.weekday;
    const startMinutes = input.startMinutes ?? existing.startMinutes;
    const endMinutes = input.endMinutes ?? existing.endMinutes;
    if (endMinutes <= startMinutes) {
      throw new DomainError("Intervalo inválido na disponibilidade", "INVALID_AVAILABILITY");
    }
    const updated = new BarberAvailability({
      id: existing.id,
      barberId: existing.barberId,
      weekday,
      startMinutes,
      endMinutes,
    });
    await this.barbers.updateAvailabilitySlot(updated);
  }
}

export class SoftDeleteAvailabilitySlotUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(requester: Requester, slotId: string): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const existing = await this.barbers.findAvailabilityById(slotId);
    if (!existing || existing.barberId !== barber.id) {
      throw new DomainError("Intervalo não encontrado", "NOT_FOUND", 404);
    }
    await this.barbers.softDeleteAvailabilitySlot(slotId, barber.id);
  }
}

export class RestoreAvailabilitySlotUseCase {
  constructor(private readonly barbers: BarberRepositoryPort) {}

  async execute(requester: Requester, slotId: string): Promise<void> {
    if (requester.role !== Role.BARBER) {
      throw new DomainError("Apenas barbeiros", "FORBIDDEN", 403);
    }
    const barber = await this.barbers.findByUserId(requester.userId);
    if (!barber) {
      throw new DomainError("Perfil de barbeiro não encontrado", "BARBER_PROFILE_MISSING", 404);
    }
    const meta = await this.barbers.findAvailabilityByIdWithMeta(slotId, true);
    if (!meta || meta.slot.barberId !== barber.id) {
      throw new DomainError("Intervalo não encontrado", "NOT_FOUND", 404);
    }
    if (!meta.deletedAt) {
      throw new DomainError("Intervalo não está apagado", "NOT_DELETED", 400);
    }
    await this.barbers.restoreAvailabilitySlot(slotId);
  }
}
