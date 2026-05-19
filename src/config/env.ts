import { config as loadDotenv } from "dotenv";

loadDotenv();

export interface AppEnv {
  NODE_ENV: string;
  PORT: number;
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_DATABASE: string;
  RABBITMQ_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NOVU_API_KEY: string;
  NOVU_BACKEND_URL: string;
  NOVU_ANALYTICS_WORKFLOW: string;
  FCM_SERVICE_ACCOUNT_JSON: string;
  REMINDER_CRON_MINUTES: number;
  REMINDER_LEAD_HOURS: number;
  REMINDER_WINDOW_MINUTES: number;
  OUTBOX_POLL_MS: number;
  OUTBOX_BATCH: number;
}

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export function loadEnv(): AppEnv {
  return {
    NODE_ENV: required("NODE_ENV", "development"),
    PORT: Number(required("PORT", "3000")),
    MYSQL_HOST: required("MYSQL_HOST", "localhost"),
    MYSQL_PORT: Number(required("MYSQL_PORT", "3306")),
    MYSQL_USER: required("MYSQL_USER", "shavely"),
    MYSQL_PASSWORD: required("MYSQL_PASSWORD", "shavely"),
    MYSQL_DATABASE: required("MYSQL_DATABASE", "shavely"),
    RABBITMQ_URL: required("RABBITMQ_URL", "amqp://guest:guest@localhost:5672"),
    JWT_SECRET: required("JWT_SECRET", "dev-secret"),
    JWT_EXPIRES_IN: required("JWT_EXPIRES_IN", "7d"),
    NOVU_API_KEY: process.env.NOVU_API_KEY ?? "",
    NOVU_BACKEND_URL: required("NOVU_BACKEND_URL", "https://api.novu.co"),
    NOVU_ANALYTICS_WORKFLOW: required("NOVU_ANALYTICS_WORKFLOW", "appointment-analytics"),
    FCM_SERVICE_ACCOUNT_JSON: process.env.FCM_SERVICE_ACCOUNT_JSON ?? "",
    REMINDER_CRON_MINUTES: Number(required("REMINDER_CRON_MINUTES", "15")),
    REMINDER_LEAD_HOURS: Number(required("REMINDER_LEAD_HOURS", "24")),
    REMINDER_WINDOW_MINUTES: Number(required("REMINDER_WINDOW_MINUTES", "30")),
    OUTBOX_POLL_MS: Number(required("OUTBOX_POLL_MS", "1000")),
    OUTBOX_BATCH: Number(required("OUTBOX_BATCH", "50")),
  };
}
