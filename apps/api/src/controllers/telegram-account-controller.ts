import { Elysia, t } from "elysia";

import type { TelegramAccountServiceContract } from "../contracts/services/telegram-account-service";
import { toTelegramAccountResource } from "../resources/telegram-account-resource";

const telegramAccountBody = t.Object({
  userId: t.String({ format: "uuid" }),
  telegramUserId: t.String({ pattern: "^[0-9]+$" }),
  privateChatId: t.String({ pattern: "^[0-9]+$" }),
  username: t.Union([t.String(), t.Null()]),
  firstName: t.String(),
  lastName: t.Union([t.String(), t.Null()]),
  languageCode: t.Union([t.String(), t.Null()]),
});

export function createTelegramAccountController(
  telegramAccountService: TelegramAccountServiceContract,
) {
  return new Elysia({ prefix: "/telegram-accounts" })
    .post(
      "/",
      async ({ body, set }) => {
        const account = await telegramAccountService.create({
          ...body,
          telegramUserId: BigInt(body.telegramUserId),
          privateChatId: BigInt(body.privateChatId),
        });

        set.status = 201;

        return toTelegramAccountResource(account);
      },
      { body: telegramAccountBody },
    )
    .get(
      "/by-user/:userId",
      async ({ params, set }) => {
        const account = await telegramAccountService.findByUserId(params.userId);

        if (!account) {
          set.status = 404;

          return { error: "Telegram account not found" };
        }

        return toTelegramAccountResource(account);
      },
      {
        params: t.Object({
          userId: t.String({ format: "uuid" }),
        }),
      },
    )
    .get(
      "/by-telegram-user/:telegramUserId",
      async ({ params, set }) => {
        const account = await telegramAccountService.findByTelegramUserId(
          BigInt(params.telegramUserId),
        );

        if (!account) {
          set.status = 404;

          return { error: "Telegram account not found" };
        }

        return toTelegramAccountResource(account);
      },
      {
        params: t.Object({
          telegramUserId: t.String({ pattern: "^[0-9]+$" }),
        }),
      },
    );
}
