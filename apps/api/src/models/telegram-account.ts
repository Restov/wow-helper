export interface TelegramAccount {
  id: string;
  userId: string;
  telegramUserId: bigint;
  privateChatId: bigint;
  username: string | null;
  firstName: string;
  lastName: string | null;
  languageCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTelegramAccountInput {
  userId: string;
  telegramUserId: bigint;
  privateChatId: bigint;
  username: string | null;
  firstName: string;
  lastName: string | null;
  languageCode: string | null;
}
