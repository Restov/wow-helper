import { describe, expect, it } from "bun:test";

import type { TelegramAccountRepositoryContract } from "../../../../apps/api/src/contracts/repositories/telegram-account-repository";
import type {
  CreateTelegramAccountInput,
  TelegramAccount,
} from "../../../../apps/api/src/models/telegram-account";
import { TelegramAccountService } from "../../../../apps/api/src/services/telegram-account-service";

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

function createRepository(): TelegramAccountRepositoryContract {
  return {
    create: async () => account,
    findByUserId: async () => undefined,
    findByTelegramUserId: async () => undefined,
  };
}

describe("TelegramAccountService", () => {
  it("creates a Telegram account through the repository", async () => {
    const service = new TelegramAccountService(createRepository());

    expect(await service.create(input)).toEqual(account);
  });

  it("finds a Telegram account by user ID through the repository", async () => {
    const repository = createRepository();
    repository.findByUserId = async () => account;
    const service = new TelegramAccountService(repository);

    expect(await service.findByUserId(account.userId)).toEqual(account);
  });

  it("finds an account by Telegram user ID through the repository", async () => {
    const repository = createRepository();
    repository.findByTelegramUserId = async () => account;
    const service = new TelegramAccountService(repository);

    expect(await service.findByTelegramUserId(account.telegramUserId)).toEqual(
      account,
    );
  });
});
