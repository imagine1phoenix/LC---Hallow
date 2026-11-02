import { neon } from '@neondatabase/serverless';

// 1. Connection string: Environment variable first, with Neon fallback for Vercel
const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  'postgresql://neondb_owner:npg_PDFlMY3msfe7@ep-morning-salad-aktmxu6r-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require';

// 2. Detect PostgreSQL / Neon
const isPostgres = Boolean(
  connectionString &&
  (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))
);

/**
 * Convert standard '?' positional placeholders to PostgreSQL '$1, $2, ...'
 */
export function convertPlaceholders(queryStr: string): string {
  let paramIndex = 1;
  return queryStr.replace(/\?/g, () => `$${paramIndex++}`);
}

// Initialize Neon client singleton
export const neonSql = isPostgres ? neon(connectionString) : null;

// Lazy SQLite reference (strictly dev-only, NEVER loaded in production or on Vercel)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteInstance: any = null;

function getSqlite() {
  if (isPostgres) return null;
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return null;
  if (!sqliteInstance) {
    try {
      // Dynamic require to prevent bundling native binaries on Vercel
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');

      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dbPath = path.join(dataDir, 'nevermore.db');
      sqliteInstance = new Database(dbPath);
      sqliteInstance.pragma('journal_mode = WAL');
      sqliteInstance.pragma('foreign_keys = ON');
    } catch (e) {
      console.warn('SQLite initialization skipped:', e);
    }
  }
  return sqliteInstance;
}

/**
 * Query returning multiple rows
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (neonSql) {
    const pgSql = convertPlaceholders(sql);
    const rows = await neonSql.query(pgSql, params);
    return rows as T[];
  }
  const db = getSqlite();
  if (db) {
    return db.prepare(sql).all(...params) as T[];
  }
  return [];
}

/**
 * Query returning a single row or null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  if (neonSql) {
    const pgSql = convertPlaceholders(sql);
    const rows = await neonSql.query(pgSql, params);
    return (rows[0] as T) || null;
  }
  const db = getSqlite();
  if (db) {
    const row = db.prepare(sql).get(...params);
    return (row as T) || null;
  }
  return null;
}

/**
 * Execute statement for INSERT, UPDATE, DELETE
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function execute(sql: string, params: any[] = []): Promise<{ changes: number }> {
  if (neonSql) {
    const pgSql = convertPlaceholders(sql);
    await neonSql.query(pgSql, params);
    return { changes: 1 };
  }
  const db = getSqlite();
  if (db) {
    const res = db.prepare(sql).run(...params);
    return { changes: res.changes };
  }
  return { changes: 0 };
}

const db = {
  query,
  queryOne,
  execute,
  isPostgres,
};

export default db;
