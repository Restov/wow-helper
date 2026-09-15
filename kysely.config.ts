import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new Pool({ connectionString }),
  },
  migrations: {
    migrationFolder: "packages/db/src/migrations",
  },
});
