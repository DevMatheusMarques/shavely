export const EVENT_VERSION = "1.0.0" as const;

export interface AppointmentCreatedEvent {
  event: "appointment.created";
  data: {
    appointmentId: string;
    clientId: string;
    barberId: string;
    serviceId: string;
    startsAt: string;
    endsAt: string;
  };
  metadata: {
    timestamp: string;
    version: string;
    eventId: string;
  };
}

export interface AppointmentCancelledEvent {
  event: "appointment.cancelled";
  data: {
    appointmentId: string;
    clientId: string;
    barberId: string;
    cancelledAt: string;
    startsAt: string;
  };
  metadata: {
    timestamp: string;
    version: string;
    eventId: string;
  };
}

export interface AppointmentReminderEvent {
  event: "appointment.reminder";
  data: {
    appointmentId: string;
    clientId: string;
    barberId: string;
    startsAt: string;
  };
  metadata: {
    timestamp: string;
    version: string;
    eventId: string;
  };
}

export type AppointmentDomainEvent =
  | AppointmentCreatedEvent
  | AppointmentCancelledEvent
  | AppointmentReminderEvent;

export const ROUTING_KEYS = {
  CREATED: "appointment.created",
  CANCELLED: "appointment.cancelled",
  REMINDER: "appointment.reminder",
} as const;
