import type { TelegramAccountRepositoryContract } from "../contracts/telegram-account-repository";

export class TelegramAccountService {
  constructor(
    private readonly telegramAccountRepository: TelegramAccountRepositoryContract,
  ) {}
}
