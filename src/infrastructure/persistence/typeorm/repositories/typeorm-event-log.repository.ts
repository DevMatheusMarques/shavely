import { randomUUID } from "node:crypto";
import type { Repository } from "typeorm";
import type { EventLogRepositoryPort } from "../../../../application/ports/event-log-repository.port.js";
import type { EventLogOrm } from "../entities/event-log.orm.js";

export class TypeormEventLogRepository implements EventLogRepositoryPort {
  constructor(private readonly repo: Repository<EventLogOrm>) {}

  async tryInsert(eventId: string, routingKey: string, consumer: string): Promise<boolean> {
    try {
      await this.repo.insert({
        id: randomUUID(),
        eventId,
        routingKey,
        consumer,
        createdAt: new Date(),
      });
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string; errno?: number })?.code;
      const errno = (err as { errno?: number })?.errno;
      if (code === "ER_DUP_ENTRY" || errno === 1062) {
        return false;
      }
      throw err;
    }
  }
}
