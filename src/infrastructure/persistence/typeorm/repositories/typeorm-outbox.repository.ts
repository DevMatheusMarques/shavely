import { IsNull, type Repository } from "typeorm";
import type {
  OutboxMessage,
  OutboxRepositoryPort,
} from "../../../../application/ports/outbox-repository.port.js";
import { OutboxMessageOrm } from "../entities/outbox-message.orm.js";

export class TypeormOutboxRepository implements OutboxRepositoryPort {
  constructor(private readonly repo: Repository<OutboxMessageOrm>) {}

  async enqueue(message: Omit<OutboxMessage, "publishedAt">): Promise<void> {
    const row = this.repo.create({
      id: message.id,
      eventId: message.eventId,
      routingKey: message.routingKey,
      payload: message.payload,
      createdAt: message.createdAt,
      publishedAt: null,
    });
    await this.repo.insert(row);
  }

  async fetchPending(limit: number): Promise<OutboxMessage[]> {
    const rows = await this.repo.find({
      where: { publishedAt: IsNull() },
      order: { createdAt: "ASC" },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      routingKey: r.routingKey,
      payload: r.payload,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt,
    }));
  }

  async markPublished(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const now = new Date();
    await this.repo
      .createQueryBuilder()
      .update(OutboxMessageOrm)
      .set({ publishedAt: now })
      .where("id IN (:...ids)", { ids })
      .execute();
  }
}
