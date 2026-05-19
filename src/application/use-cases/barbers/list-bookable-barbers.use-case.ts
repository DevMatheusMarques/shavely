import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

/** Barbeiros activos para o cliente escolher na marcação (sem dados sensíveis). */
export class ListBookableBarbersUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(): Promise<Array<{ barberId: string; name: string }>> {
    const rows = await this.barbers.listWithMeta({ includeDeleted: false });
    const out: Array<{ barberId: string; name: string }> = [];
    for (const { barber, deletedAt } of rows) {
      if (deletedAt) continue;
      const u = await this.users.findById(barber.userId, false);
      if (!u) continue;
      out.push({ barberId: barber.id, name: u.name });
    }
    out.sort((a, b) => a.name.localeCompare(b.name, "pt"));
    return out;
  }
}
