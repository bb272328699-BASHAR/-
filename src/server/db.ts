import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Cloud SQL uses unix domain socket when SQL_HOST starts with /
const isSocket = process.env.SQL_HOST && process.env.SQL_HOST.startsWith('/');

export const pool = new Pool(
  isSocket
    ? {
        user: process.env.SQL_USER || 'ai_studio_app_user',
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
        host: process.env.SQL_HOST,
      }
    : {
        user: process.env.SQL_USER || 'ai_studio_app_user',
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
        host: process.env.SQL_HOST || 'localhost',
        port: Number(process.env.SQL_PORT || 5432),
      }
);

// Helper for queries with params
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
}
