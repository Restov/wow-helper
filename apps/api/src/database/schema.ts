import type { ColumnType, Generated } from "kysely";

import type { UserStatus } from "../models/user";

type Timestamp = ColumnType<
  Date,
  Date | string | undefined,
  Date | string
>;

type BigIntColumn = ColumnType<string, bigint | string, bigint | string>;

export interface UsersTable {
  id: Generated<string>;
  status: Generated<UserStatus>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TelegramAccountsTable {
  id: Generated<string>;
  user_id: string;
  telegram_user_id: BigIntColumn;
  private_chat_id: BigIntColumn;
  username: string | null;
  first_name: string;
  last_name: string | null;
  language_code: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Database {
  users: UsersTable;
  telegram_accounts: TelegramAccountsTable;
}
