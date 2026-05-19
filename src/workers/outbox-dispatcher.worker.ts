import "reflect-metadata";
import AppDataSource from "../infrastructure/database/data-source.js";
import { loadEnv } from "../config/env.js";
import { TypeormOutboxRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-outbox.repository.js";
import { OutboxMessageOrm } from "../infrastructure/persistence/typeorm/entities/outbox-message.orm.js";
import { createConfirmChannel } from "../infrastructure/messaging/rabbitmq/create-confirm-channel.js";
import { assertAppointmentsTopology } from "../infrastructure/messaging/rabbitmq/rabbitmq-topology.js";
import { RabbitMqPublisher } from "../infrastructure/messaging/rabbitmq/rabbitmq-publisher.js";
import { sleep } from "../infrastructure/util/sleep.js";

async function main(): Promise<void> {
  const env = loadEnv();
  await AppDataSource.initialize();
  const outboxRepo = new TypeormOutboxRepository(AppDataSource.getRepository(OutboxMessageOrm));
  const { channel } = await createConfirmChannel(env.RABBITMQ_URL);
  await assertAppointmentsTopology(channel);
  const publisher = new RabbitMqPublisher(channel);
  for (;;) {
    const batch = await outboxRepo.fetchPending(env.OUTBOX_BATCH);
    if (batch.length === 0) {
      await sleep(env.OUTBOX_POLL_MS);
      continue;
    }
    const publishedIds: string[] = [];
    for (const msg of batch) {
      try {
        const body = JSON.parse(msg.payload) as unknown;
        await publisher.publishJson(msg.routingKey, body, { eventId: msg.eventId, persistent: true });
        publishedIds.push(msg.id);
      } catch {
        await sleep(env.OUTBOX_POLL_MS);
        break;
      }
    }
    if (publishedIds.length > 0) {
      await outboxRepo.markPublished(publishedIds);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
