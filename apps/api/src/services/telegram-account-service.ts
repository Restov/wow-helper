import type { TelegramAccountRepositoryContract } from "../contracts/repositories/telegram-account-repository";
import type { TelegramAccountServiceContract } from "../contracts/services/telegram-account-service";
import type {
  CreateTelegramAccountInput,
  TelegramAccount,
} from "../models/telegram-account";

export class TelegramAccountService implements TelegramAccountServiceContract {
  constructor(
    private readonly telegramAccountRepository: TelegramAccountRepositoryContract,
  ) {}

  findByUserId(userId: string): Promise<TelegramAccount | undefined> {
    return this.telegramAccountRepository.findByUserId(userId);
  }

  findByTelegramUserId(
    telegramUserId: bigint,
  ): Promise<TelegramAccount | undefined> {
    return this.telegramAccountRepository.findByTelegramUserId(telegramUserId);
  }

  create(input: CreateTelegramAccountInput): Promise<TelegramAccount> {
    return this.telegramAccountRepository.create(input);
  }
}
