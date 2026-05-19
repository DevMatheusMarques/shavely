import type { ConfirmChannel } from "amqplib";
import {
  APPOINTMENTS_DLX,
  APPOINTMENTS_EXCHANGE,
  APPOINTMENT_ROUTING_KEYS,
  DLQ_ROUTING_KEYS,
  QUEUES,
} from "./rabbitmq-constants.js";

export async function assertAppointmentsTopology(channel: ConfirmChannel): Promise<void> {
  await channel.assertExchange(APPOINTMENTS_EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(APPOINTMENTS_DLX, "topic", { durable: true });

  await channel.assertQueue(QUEUES.notificationsDlq, { durable: true });
  await channel.bindQueue(QUEUES.notificationsDlq, APPOINTMENTS_DLX, DLQ_ROUTING_KEYS.notifications);

  await channel.assertQueue(QUEUES.analyticsDlq, { durable: true });
  await channel.bindQueue(QUEUES.analyticsDlq, APPOINTMENTS_DLX, DLQ_ROUTING_KEYS.analytics);

  await channel.assertQueue(QUEUES.notifications, {
    durable: true,
    deadLetterExchange: APPOINTMENTS_DLX,
    deadLetterRoutingKey: DLQ_ROUTING_KEYS.notifications,
  });
  await channel.assertQueue(QUEUES.analytics, {
    durable: true,
    deadLetterExchange: APPOINTMENTS_DLX,
    deadLetterRoutingKey: DLQ_ROUTING_KEYS.analytics,
  });

  for (const rk of APPOINTMENT_ROUTING_KEYS) {
    await channel.bindQueue(QUEUES.notifications, APPOINTMENTS_EXCHANGE, rk);
    await channel.bindQueue(QUEUES.analytics, APPOINTMENTS_EXCHANGE, rk);
  }
}
