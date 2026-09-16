import type {
  CreateTelegramAccountInput,
  TelegramAccount,
} from "../models/telegram-account";

export interface TelegramAccountRepositoryContract {
  findByUserId(userId: string): Promise<TelegramAccount | undefined>;
  findByTelegramUserId(
    telegramUserId: bigint,
  ): Promise<TelegramAccount | undefined>;
  create(input: CreateTelegramAccountInput): Promise<TelegramAccount>;
}
