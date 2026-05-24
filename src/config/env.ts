import { config as loadDotenv } from "dotenv";

loadDotenv();

export interface AppEnv {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DATABASE: string;
  POSTGRES_SSL: boolean;
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

function parseDatabaseUrl(url: string): Pick<
  AppEnv,
  "POSTGRES_HOST" | "POSTGRES_PORT" | "POSTGRES_USER" | "POSTGRES_PASSWORD" | "POSTGRES_DATABASE"
> {
  const parsed = new URL(url.replace(/^postgresql:/, "postgres:"));
  const database = parsed.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL must include a database name");
  }

  return {
    POSTGRES_HOST: parsed.hostname,
    POSTGRES_PORT: Number(parsed.port || "5432"),
    POSTGRES_USER: decodeURIComponent(parsed.username),
    POSTGRES_PASSWORD: decodeURIComponent(parsed.password),
    POSTGRES_DATABASE: database,
  };
}

export function loadEnv(): AppEnv {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const postgresFromUrl = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;
  const postgresSsl =
    process.env.POSTGRES_SSL === "true" ||
    process.env.POSTGRES_SSL === "1" ||
    databaseUrl.includes("render.com");

  return {
    NODE_ENV: required("NODE_ENV", "development"),
    PORT: Number(required("PORT", "3000")),
    DATABASE_URL: databaseUrl,
    POSTGRES_SSL: postgresSsl,
    POSTGRES_HOST: postgresFromUrl?.POSTGRES_HOST ?? required("POSTGRES_HOST", "localhost"),
    POSTGRES_PORT: postgresFromUrl?.POSTGRES_PORT ?? Number(required("POSTGRES_PORT", "5432")),
    POSTGRES_USER: postgresFromUrl?.POSTGRES_USER ?? required("POSTGRES_USER", "shavely"),
    POSTGRES_PASSWORD: postgresFromUrl?.POSTGRES_PASSWORD ?? required("POSTGRES_PASSWORD", "shavely"),
    POSTGRES_DATABASE: postgresFromUrl?.POSTGRES_DATABASE ?? required("POSTGRES_DATABASE", "shavely"),
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
