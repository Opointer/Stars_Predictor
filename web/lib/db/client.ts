import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

declare global {
  var __starsSql: ReturnType<typeof postgres> | undefined;
}

export function getDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set. Run the pipeline seed job before starting the web app.");
  }

  const client =
    globalThis.__starsSql ??
    postgres(url, {
      prepare: false,
      max: 3
    });

  if (!globalThis.__starsSql) {
    globalThis.__starsSql = client;
  }

  return drizzle(client, { schema });
}
