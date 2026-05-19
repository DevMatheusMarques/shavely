import type { ConfirmChannel } from "amqplib";
import { APPOINTMENTS_EXCHANGE } from "./rabbitmq-constants.js";

export class RabbitMqPublisher {
  constructor(private readonly channel: ConfirmChannel) {}

  async publishJson(
    routingKey: string,
    body: unknown,
    options?: { eventId?: string; persistent?: boolean },
  ): Promise<void> {
    const buf = Buffer.from(JSON.stringify(body));
    this.channel.publish(APPOINTMENTS_EXCHANGE, routingKey, buf, {
      persistent: options?.persistent ?? true,
      headers: options?.eventId ? { "x-event-id": options.eventId } : undefined,
      messageId: options?.eventId,
    });
    await this.channel.waitForConfirms();
  }
}
