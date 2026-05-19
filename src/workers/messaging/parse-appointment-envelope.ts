import type { AppointmentDomainEvent } from "../../shared/events/index.js";

export interface ParsedEnvelope {
  routingKey: string;
  eventId: string;
  event: AppointmentDomainEvent;
}

export function parseAppointmentEnvelope(
  routingKey: string,
  raw: Buffer,
): ParsedEnvelope {
  const json = JSON.parse(raw.toString("utf8")) as AppointmentDomainEvent;
  const eventId = json.metadata?.eventId;
  if (!eventId) {
    throw new Error("Envelope sem metadata.eventId");
  }
  return { routingKey, eventId, event: json };
}
