import "reflect-metadata";
import { randomUUID } from "node:crypto";
import AppDataSource from "../infrastructure/database/data-source.js";
import { loadEnv } from "../config/env.js";
import { TypeormAppointmentRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-appointment.repository.js";
import { AppointmentOrm } from "../infrastructure/persistence/typeorm/entities/appointment.orm.js";
import { createConfirmChannel } from "../infrastructure/messaging/rabbitmq/create-confirm-channel.js";
import { assertAppointmentsTopology } from "../infrastructure/messaging/rabbitmq/rabbitmq-topology.js";
import { RabbitMqPublisher } from "../infrastructure/messaging/rabbitmq/rabbitmq-publisher.js";
import { ROUTING_KEYS, EVENT_VERSION, type AppointmentReminderEvent } from "../shared/events/index.js";
import { sleep } from "../infrastructure/util/sleep.js";

async function tick(env: ReturnType<typeof loadEnv>, publisher: RabbitMqPublisher, appts: TypeormAppointmentRepository): Promise<void> {
  const now = new Date();
  const leadMs = env.REMINDER_LEAD_HOURS * 60 * 60 * 1000;
  const halfWindow = (env.REMINDER_WINDOW_MINUTES * 60 * 1000) / 2;
  const center = new Date(now.getTime() + leadMs);
  const windowStart = new Date(center.getTime() - halfWindow);
  const windowEnd = new Date(center.getTime() + halfWindow);
  const due = await appts.findUpcomingForReminder(windowStart, windowEnd);
  for (const a of due) {
    const eventId = randomUUID();
    const event: AppointmentReminderEvent = {
      event: "appointment.reminder",
      data: {
        appointmentId: a.id,
        clientId: a.clientId,
        barberId: a.barberId,
        startsAt: a.startsAt.toISOString(),
      },
      metadata: {
        timestamp: now.toISOString(),
        version: EVENT_VERSION,
        eventId,
      },
    };
    await publisher.publishJson(ROUTING_KEYS.REMINDER, event, { eventId, persistent: true });
    await appts.markReminderSent(a.id, now);
  }
}

async function main(): Promise<void> {
  const env = loadEnv();
  await AppDataSource.initialize();
  const appts = new TypeormAppointmentRepository(AppDataSource.getRepository(AppointmentOrm));
  const { channel } = await createConfirmChannel(env.RABBITMQ_URL);
  await assertAppointmentsTopology(channel);
  const publisher = new RabbitMqPublisher(channel);
  const intervalMs = Math.max(1, env.REMINDER_CRON_MINUTES) * 60 * 1000;
  for (;;) {
    try {
      await tick(env, publisher, appts);
    } catch (err) {
      console.error("reminder tick failed", err);
    }
    await sleep(intervalMs);
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
