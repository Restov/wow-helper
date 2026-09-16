import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";

import type { TelegramAccountServiceContract } from "./contracts/services/telegram-account-service";
import type { UserServiceContract } from "./contracts/services/user-service";
import { createTelegramAccountController } from "./controllers/telegram-account-controller";
import { createUserController } from "./controllers/user-controller";
import { requestLogger } from "./logger";

export interface AppDependencies {
  userService: UserServiceContract;
  telegramAccountService: TelegramAccountServiceContract;
}

export function createApp(dependencies: AppDependencies) {
  return new Elysia()
    .use(requestLogger)
    .get("/health", () => ({ status: "ok" }))
    .use(createUserController(dependencies.userService))
    .use(
      createTelegramAccountController(dependencies.telegramAccountService),
    )
    .use(openapi());
}
