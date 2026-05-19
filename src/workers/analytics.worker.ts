import "reflect-metadata";
import type { ConsumeMessage } from "amqplib";
import AppDataSource from "../infrastructure/database/data-source.js";
import { loadEnv } from "../config/env.js";
import { TypeormEventLogRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-event-log.repository.js";
import { EventLogOrm } from "../infrastructure/persistence/typeorm/entities/event-log.orm.js";
import { createConfirmChannel } from "../infrastructure/messaging/rabbitmq/create-confirm-channel.js";
import { assertAppointmentsTopology } from "../infrastructure/messaging/rabbitmq/rabbitmq-topology.js";
import { QUEUES } from "../infrastructure/messaging/rabbitmq/rabbitmq-constants.js";
import { NovuAnalyticsService } from "../infrastructure/analytics/novu-analytics.service.js";
import { parseAppointmentEnvelope } from "./messaging/parse-appointment-envelope.js";
import { runWithBackoff } from "./messaging/retry-backoff.js";

const CONSUMER = "analytics-worker";

async function main(): Promise<void> {
  const env = loadEnv();
  await AppDataSource.initialize();
  const eventLogs = new TypeormEventLogRepository(AppDataSource.getRepository(EventLogOrm));
  const novu = new NovuAnalyticsService(env);
  const { connection, channel } = await createConfirmChannel(env.RABBITMQ_URL);
  await assertAppointmentsTopology(channel);
  channel.prefetch(1);

  await channel.consume(
    QUEUES.analytics,
    (msg: ConsumeMessage | null) => {
      if (!msg) {
        return;
      }
      void (async () => {
        try {
          const parsed = parseAppointmentEnvelope(msg.fields.routingKey, msg.content);
          const first = await eventLogs.tryInsert(parsed.eventId, parsed.routingKey, CONSUMER);
          if (!first) {
            channel.ack(msg);
            return;
          }
          await runWithBackoff(async () => {
            await novu.trackAppointmentEvent({
              name: parsed.event.event,
              payload: { ...parsed.event.data },
              actorSubscriberId: parsed.event.data.clientId,
              transactionId: parsed.eventId,
            });
          });
          channel.ack(msg);
        } catch {
          channel.nack(msg, false, false);
        }
      })();
    },
    { noAck: false },
  );

  process.on("SIGINT", async () => {
    await channel.close();
    await connection.close();
    await AppDataSource.destroy();
    process.exit(0);
  });
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
