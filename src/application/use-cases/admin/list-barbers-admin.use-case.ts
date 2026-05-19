import type { AdminListQuery } from "../../dto/admin.dto.js";
import type { BarberRepositoryPort } from "../../ports/barber-repository.port.js";
import type { UserRepositoryPort } from "../../ports/user-repository.port.js";

export class ListBarbersAdminUseCase {
  constructor(
    private readonly barbers: BarberRepositoryPort,
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(query: AdminListQuery): Promise<
    Array<{
      barberId: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      user: { email: string; name: string; phoneE164: string | null };
    }>
  > {
    const rows = await this.barbers.listWithMeta({ includeDeleted: query.includeDeleted });
    const out: Array<{
      barberId: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      user: { email: string; name: string; phoneE164: string | null };
    }> = [];
    for (const { barber, deletedAt } of rows) {
      const u = await this.users.findById(barber.userId, query.includeDeleted === true);
      if (!u) {
        continue;
      }
      out.push({
        barberId: barber.id,
        userId: barber.userId,
        createdAt: barber.toProps().createdAt.toISOString(),
        updatedAt: barber.toProps().updatedAt.toISOString(),
        deletedAt: deletedAt ? deletedAt.toISOString() : null,
        user: { email: u.email, name: u.name, phoneE164: u.phoneE164 },
      });
    }
    return out;
  }
}
