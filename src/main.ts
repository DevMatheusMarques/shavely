import "reflect-metadata";
import { loadEnv } from "./config/env.js";
import { createServer } from "./interfaces/http/create-server.js";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await createServer();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
