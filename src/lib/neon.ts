import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

export const neonSql = connectionString ? neon(connectionString) : null;

export default neonSql;

