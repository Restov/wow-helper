import type {
  CreateTelegramAccountInput,
  TelegramAccount,
} from "../../models/telegram-account";

export interface TelegramAccountServiceContract {
  findByUserId(userId: string): Promise<TelegramAccount | undefined>;
  findByTelegramUserId(
    telegramUserId: bigint,
  ): Promise<TelegramAccount | undefined>;
  create(input: CreateTelegramAccountInput): Promise<TelegramAccount>;
}
