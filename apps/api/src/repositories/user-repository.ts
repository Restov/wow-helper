import type { Selectable } from "kysely";
import type { Kysely } from "kysely";

import type { UserRepositoryContract } from "../contracts/repositories/user-repository";
import type { Database, UsersTable } from "../database/schema";
import type { User } from "../models/user";

type UserRow = Selectable<UsersTable>;

export class UserRepository implements UserRepositoryContract {
  private readonly tableName = "users" as const;

  constructor(private readonly db: Kysely<Database>) {}

  async findById(id: string): Promise<User | undefined> {
    const row = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return row ? mapUser(row) : undefined;
  }

  async create(): Promise<User> {
    const row = await this.db
      .insertInto(this.tableName)
      .defaultValues()
      .returningAll()
      .executeTakeFirstOrThrow();

    return mapUser(row);
  }
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
