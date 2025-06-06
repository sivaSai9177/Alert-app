import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Determine which database URL to use based on APP_ENV
const APP_ENV = process.env.APP_ENV || 'development';

let DATABASE_URL: string;

switch (APP_ENV) {
  case 'local':
    DATABASE_URL = process.env.LOCAL_DATABASE_URL || 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev';
    break;
  case 'preview':
    DATABASE_URL = process.env.PREVIEW_DATABASE_URL || 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_preview';
    break;
  case 'staging':
    DATABASE_URL = process.env.STAGING_DATABASE_URL || process.env.NEON_DATABASE_URL || '';
    break;
  case 'production':
    DATABASE_URL = process.env.PRODUCTION_DATABASE_URL || process.env.NEON_DATABASE_URL || '';
    break;
  default:
    // development
    DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
}

console.log(`📦 Drizzle Kit Configuration`);
console.log(`🌍 Environment: ${APP_ENV}`);
console.log(`📊 Database: ${DATABASE_URL.includes('localhost') ? 'Local PostgreSQL' : 'Neon Cloud'}`);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
