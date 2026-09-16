import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("telegram_accounts")
    .addColumn("id", "uuid", (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("user_id", "uuid", (column) =>
      column.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("telegram_user_id", "bigint", (column) => column.notNull())
    .addColumn("private_chat_id", "bigint", (column) => column.notNull())
    .addColumn("username", "text")
    .addColumn("first_name", "text", (column) => column.notNull())
    .addColumn("last_name", "text")
    .addColumn("language_code", "text")
    .addColumn("created_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint("telegram_accounts_user_id_unique", ["user_id"])
    .addUniqueConstraint("telegram_accounts_telegram_user_id_unique", [
      "telegram_user_id",
    ])
    .addUniqueConstraint("telegram_accounts_private_chat_id_unique", [
      "private_chat_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("telegram_accounts").execute();
}
