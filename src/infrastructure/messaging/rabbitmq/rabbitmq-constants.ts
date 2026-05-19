export const APPOINTMENTS_EXCHANGE = "appointments.exchange";
export const APPOINTMENTS_DLX = "appointments.dlx";

export const QUEUES = {
  notifications: "notifications.queue",
  analytics: "analytics.queue",
  notificationsDlq: "notifications.dlq",
  analyticsDlq: "analytics.dlq",
} as const;

export const DLQ_ROUTING_KEYS = {
  notifications: "notifications.dead",
  analytics: "analytics.dead",
} as const;

export const APPOINTMENT_ROUTING_KEYS = [
  "appointment.created",
  "appointment.cancelled",
  "appointment.reminder",
] as const;
