import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { createApp } from "./app";
import type { Database } from "./database/schema";
import { logger } from "./logger";
import { TelegramAccountRepository } from "./repositories/telegram-account-repository";
import { UserRepository } from "./repositories/user-repository";
import { TelegramAccountService } from "./services/telegram-account-service";
import { UserService } from "./services/user-service";

const connectionString = Bun.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString }),
  }),
});

const userService = new UserService(new UserRepository(db));
const telegramAccountService = new TelegramAccountService(
  new TelegramAccountRepository(db),
);

const port = Number(Bun.env.PORT ?? 3000);
const hostname = Bun.env.HOST ?? "0.0.0.0";

const app = createApp({ userService, telegramAccountService }).listen({
  hostname,
  port,
});

logger.info(
  {
    hostname: app.server?.hostname,
    port: app.server?.port,
  },
  "API started",
);
