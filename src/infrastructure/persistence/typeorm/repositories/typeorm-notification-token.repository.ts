import { randomUUID } from "node:crypto";
import { In, type Repository } from "typeorm";
import type {
  NotificationTokenRecord,
  NotificationTokenRepositoryPort,
} from "../../../../application/ports/notification-token-repository.port.js";
import type { NotificationTokenOrm } from "../entities/notification-token.orm.js";

export class TypeormNotificationTokenRepository implements NotificationTokenRepositoryPort {
  constructor(private readonly repo: Repository<NotificationTokenOrm>) {}

  async upsert(userId: string, token: string, platform: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { userId, token } });
    if (existing) {
      return;
    }
    await this.repo.insert({
      id: randomUUID(),
      userId,
      token,
      platform,
      createdAt: new Date(),
    });
  }

  async listByUserIds(userIds: string[]): Promise<NotificationTokenRecord[]> {
    if (userIds.length === 0) {
      return [];
    }
    const rows = await this.repo.find({ where: { userId: In(userIds) } });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      token: r.token,
      platform: r.platform,
      createdAt: r.createdAt,
    }));
  }
}
