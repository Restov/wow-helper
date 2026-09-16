import type { TelegramAccount } from "../models/telegram-account";

export function toTelegramAccountResource(account: TelegramAccount) {
  return {
    id: account.id,
    userId: account.userId,
    telegramUserId: account.telegramUserId.toString(),
    privateChatId: account.privateChatId.toString(),
    username: account.username,
    firstName: account.firstName,
    lastName: account.lastName,
    languageCode: account.languageCode,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}
