import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("[DB] DATABASE_URL environment variable is not set");
}

const DATABASE_URL = process.env.DATABASE_URL;
const isLocal = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');

console.log("[DB] Connecting to database...");
console.log(`[DB] Database type: ${isLocal ? 'Local PostgreSQL' : 'Neon Cloud'}`);

let db: any;

if (isLocal) {
  // For local database, use node-postgres
  console.log("[DB] Using PostgreSQL driver for local database");
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false,
  });
  db = drizzlePg(pool);
} else {
  // For cloud database, use Neon HTTP
  console.log("[DB] Using Neon HTTP driver for cloud database");
  const sql = neon(DATABASE_URL);
  db = drizzleNeon(sql);
}

export { db };
console.log("[DB] Database client initialized");

