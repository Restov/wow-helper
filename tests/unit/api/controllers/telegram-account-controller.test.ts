import { describe, expect, it } from "bun:test";

import type { TelegramAccountServiceContract } from "../../../../apps/api/src/contracts/services/telegram-account-service";
import { createTelegramAccountController } from "../../../../apps/api/src/controllers/telegram-account-controller";
import type {
  CreateTelegramAccountInput,
  TelegramAccount,
} from "../../../../apps/api/src/models/telegram-account";

const input: CreateTelegramAccountInput = {
  userId: "8db06ca3-d265-4a86-b94c-209c4dfb93e5",
  telegramUserId: 123456789n,
  privateChatId: 987654321n,
  username: "thrall",
  firstName: "Thrall",
  lastName: null,
  languageCode: "en",
};

const account: TelegramAccount = {
  id: "99100b9b-4cb1-457c-b223-003625940270",
  ...input,
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  updatedAt: new Date("2026-09-16T00:00:00.000Z"),
};

function createService(): TelegramAccountServiceContract {
  return {
    create: async () => account,
    findByUserId: async () => undefined,
    findByTelegramUserId: async () => undefined,
  };
}

const serializedAccount = {
  ...account,
  telegramUserId: account.telegramUserId.toString(),
  privateChatId: account.privateChatId.toString(),
  createdAt: account.createdAt.toISOString(),
  updatedAt: account.updatedAt.toISOString(),
};

describe("TelegramAccountController", () => {
  it("creates a Telegram account", async () => {
    const controller = createTelegramAccountController(createService());

    const response = await controller.handle(
      new Request("http://localhost/telegram-accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...input,
          telegramUserId: input.telegramUserId.toString(),
          privateChatId: input.privateChatId.toString(),
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(serializedAccount);
  });

  it("returns a Telegram account by user ID", async () => {
    const service = createService();
    service.findByUserId = async () => account;
    const controller = createTelegramAccountController(service);

    const response = await controller.handle(
      new Request(
        `http://localhost/telegram-accounts/by-user/${account.userId}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(serializedAccount);
  });

  it("returns an account by Telegram user ID", async () => {
    const service = createService();
    service.findByTelegramUserId = async () => account;
    const controller = createTelegramAccountController(service);

    const response = await controller.handle(
      new Request(
        `http://localhost/telegram-accounts/by-telegram-user/${account.telegramUserId}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(serializedAccount);
  });

  it("returns 404 when no account exists for the user", async () => {
    const controller = createTelegramAccountController(createService());

    const response = await controller.handle(
      new Request(
        "http://localhost/telegram-accounts/by-user/00000000-0000-4000-8000-000000000000",
      ),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Telegram account not found",
    });
  });

  it("returns 404 when the Telegram user has no account", async () => {
    const controller = createTelegramAccountController(createService());

    const response = await controller.handle(
      new Request(
        "http://localhost/telegram-accounts/by-telegram-user/123456789",
      ),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Telegram account not found",
    });
  });

  it("rejects a non-numeric Telegram user ID", async () => {
    const controller = createTelegramAccountController(createService());

    const response = await controller.handle(
      new Request(
        "http://localhost/telegram-accounts/by-telegram-user/not-a-number",
      ),
    );

    expect(response.status).toBe(422);
  });

  it("rejects an invalid internal user ID", async () => {
    const controller = createTelegramAccountController(createService());

    const response = await controller.handle(
      new Request("http://localhost/telegram-accounts/by-user/not-a-uuid"),
    );

    expect(response.status).toBe(422);
  });

  it("rejects an invalid user ID when creating an account", async () => {
    const controller = createTelegramAccountController(createService());

    const response = await controller.handle(
      new Request("http://localhost/telegram-accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...input,
          userId: "not-a-uuid",
          telegramUserId: input.telegramUserId.toString(),
          privateChatId: input.privateChatId.toString(),
        }),
      }),
    );

    expect(response.status).toBe(422);
  });
});
