import type { Kysely, Selectable } from "kysely";

import type { TelegramAccountRepositoryContract } from "../contracts/repositories/telegram-account-repository";
import type { Database, TelegramAccountsTable } from "../database/schema";
import type {
  CreateTelegramAccountInput,
  TelegramAccount,
} from "../models/telegram-account";

type TelegramAccountRow = Selectable<TelegramAccountsTable>;

export class TelegramAccountRepository
  implements TelegramAccountRepositoryContract
{
  private readonly tableName = "telegram_accounts" as const;

  constructor(private readonly db: Kysely<Database>) {}

  async findByUserId(userId: string): Promise<TelegramAccount | undefined> {
    const row = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return row ? mapTelegramAccount(row) : undefined;
  }

  async findByTelegramUserId(
    telegramUserId: bigint,
  ): Promise<TelegramAccount | undefined> {
    const row = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where("telegram_user_id", "=", telegramUserId.toString())
      .executeTakeFirst();

    return row ? mapTelegramAccount(row) : undefined;
  }

  async create(input: CreateTelegramAccountInput): Promise<TelegramAccount> {
    const row = await this.db
      .insertInto(this.tableName)
      .values({
        user_id: input.userId,
        telegram_user_id: input.telegramUserId.toString(),
        private_chat_id: input.privateChatId.toString(),
        username: input.username,
        first_name: input.firstName,
        last_name: input.lastName,
        language_code: input.languageCode,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return mapTelegramAccount(row);
  }
}

function mapTelegramAccount(row: TelegramAccountRow): TelegramAccount {
  return {
    id: row.id,
    userId: row.user_id,
    telegramUserId: BigInt(row.telegram_user_id),
    privateChatId: BigInt(row.private_chat_id),
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    languageCode: row.language_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
