import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "../../../apps/api/src/database/schema";
import { TelegramAccountRepository } from "../../../apps/api/src/repositories/telegram-account-repository";
import { UserRepository } from "../../../apps/api/src/repositories/user-repository";

const connectionString = Bun.env.TEST_DATABASE_URL;

if (!connectionString) {
  throw new Error("TEST_DATABASE_URL is required");
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString }),
  }),
});

const userRepository = new UserRepository(db);
const telegramAccountRepository = new TelegramAccountRepository(db);

beforeAll(async () => {
  await db.deleteFrom("telegram_accounts").execute();
  await db.deleteFrom("users").execute();
});

beforeEach(async () => {
  await db.deleteFrom("telegram_accounts").execute();
  await db.deleteFrom("users").execute();
});

afterAll(async () => {
  await db.destroy();
});

describe("UserRepository", () => {
  it("creates an active user", async () => {
    const user = await userRepository.create();

    expect(user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(user.status).toBe("active");
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);

    const storedUser = await db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", user.id)
      .executeTakeFirst();

    expect(storedUser?.id).toBe(user.id);
  });

  it("finds a user by ID", async () => {
    const createdUser = await userRepository.create();

    const user = await userRepository.findById(createdUser.id);

    expect(user).toEqual(createdUser);
  });
});

describe("TelegramAccountRepository", () => {
  it("creates a Telegram account", async () => {
    const user = await userRepository.create();

    const account = await telegramAccountRepository.create({
      userId: user.id,
      telegramUserId: 123456789012345n,
      privateChatId: 987654321098765n,
      username: "thrall",
      firstName: "Thrall",
      lastName: null,
      languageCode: "en",
    });

    expect(account).toMatchObject({
      userId: user.id,
      telegramUserId: 123456789012345n,
      privateChatId: 987654321098765n,
      username: "thrall",
      firstName: "Thrall",
      lastName: null,
      languageCode: "en",
    });
    expect(account.createdAt).toBeInstanceOf(Date);
    expect(account.updatedAt).toBeInstanceOf(Date);

    const storedAccount = await db
      .selectFrom("telegram_accounts")
      .selectAll()
      .where("id", "=", account.id)
      .executeTakeFirst();

    expect(storedAccount?.id).toBe(account.id);
  });

  it("finds a Telegram account by user ID", async () => {
    const user = await userRepository.create();
    const createdAccount = await telegramAccountRepository.create({
      userId: user.id,
      telegramUserId: 111111111111111n,
      privateChatId: 222222222222222n,
      username: null,
      firstName: "Jaina",
      lastName: "Proudmoore",
      languageCode: null,
    });

    const account = await telegramAccountRepository.findByUserId(user.id);

    expect(account).toEqual(createdAccount);
  });

  it("finds a Telegram account by Telegram user ID", async () => {
    const user = await userRepository.create();
    const telegramUserId = 333333333333333n;
    const createdAccount = await telegramAccountRepository.create({
      userId: user.id,
      telegramUserId,
      privateChatId: 444444444444444n,
      username: "sylvanas",
      firstName: "Sylvanas",
      lastName: "Windrunner",
      languageCode: "en",
    });

    const account =
      await telegramAccountRepository.findByTelegramUserId(telegramUserId);

    expect(account).toEqual(createdAccount);
  });
});
