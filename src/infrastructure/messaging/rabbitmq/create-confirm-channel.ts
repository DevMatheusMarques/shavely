import type { ChannelModel, ConfirmChannel } from "amqplib";
import amqp from "amqplib";

export async function createConfirmChannel(url: string): Promise<{
  connection: ChannelModel;
  channel: ConfirmChannel;
}> {
  const connection = await amqp.connect(url);
  const channel = await connection.createConfirmChannel();
  return { connection, channel };
}
