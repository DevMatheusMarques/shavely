import "reflect-metadata";
import type { ConsumeMessage } from "amqplib";
import AppDataSource from "../infrastructure/database/data-source.js";
import { loadEnv } from "../config/env.js";
import { TypeormEventLogRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-event-log.repository.js";
import { TypeormNotificationTokenRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-notification-token.repository.js";
import { TypeormBarberRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-barber.repository.js";
import { EventLogOrm } from "../infrastructure/persistence/typeorm/entities/event-log.orm.js";
import { NotificationTokenOrm } from "../infrastructure/persistence/typeorm/entities/notification-token.orm.js";
import { BarberOrm } from "../infrastructure/persistence/typeorm/entities/barber.orm.js";
import { BarberAvailabilityOrm } from "../infrastructure/persistence/typeorm/entities/barber-availability.orm.js";
import { createConfirmChannel } from "../infrastructure/messaging/rabbitmq/create-confirm-channel.js";
import { assertAppointmentsTopology } from "../infrastructure/messaging/rabbitmq/rabbitmq-topology.js";
import { QUEUES } from "../infrastructure/messaging/rabbitmq/rabbitmq-constants.js";
import { FirebasePushService } from "../infrastructure/notifications/firebase-push.service.js";
import { parseAppointmentEnvelope } from "./messaging/parse-appointment-envelope.js";
import { runWithBackoff } from "./messaging/retry-backoff.js";

const CONSUMER = "notifications-worker";

async function main(): Promise<void> {
  const env = loadEnv();
  await AppDataSource.initialize();
  const eventLogs = new TypeormEventLogRepository(AppDataSource.getRepository(EventLogOrm));
  const tokensRepo = new TypeormNotificationTokenRepository(AppDataSource.getRepository(NotificationTokenOrm));
  const barbers = new TypeormBarberRepository(
    AppDataSource.getRepository(BarberOrm),
    AppDataSource.getRepository(BarberAvailabilityOrm),
  );
  const fcm = new FirebasePushService(env);
  const { connection, channel } = await createConfirmChannel(env.RABBITMQ_URL);
  await assertAppointmentsTopology(channel);
  channel.prefetch(1);

  await channel.consume(
    QUEUES.notifications,
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
            const barber = await barbers.findById(parsed.event.data.barberId);
            if (!barber) {
              return;
            }
            const userIds = [parsed.event.data.clientId, barber.userId];
            const tokens = await tokensRepo.listByUserIds(userIds);
            const tokenList = tokens.map((t) => t.token);
            let title = "Shavely";
            let body = "Atualização de agendamento";
            const data: Record<string, string> = {
              appointmentId: parsed.event.data.appointmentId,
              type: parsed.event.event,
            };
            if (parsed.event.event === "appointment.created") {
              title = "Agendamento confirmado";
              body = "Seu horário foi criado.";
            } else if (parsed.event.event === "appointment.cancelled") {
              title = "Agendamento cancelado";
              body = "Um agendamento foi cancelado.";
            } else if (parsed.event.event === "appointment.reminder") {
              title = "Lembrete de corte";
              body = "Você tem um horário chegando.";
            }
            await fcm.sendMulticast({ tokens: tokenList, title, body, data });
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
