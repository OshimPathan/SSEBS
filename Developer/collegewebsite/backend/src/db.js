import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/seven_star_school',
  ssl: process.env.DATABASE_URL?.includes('insforge') ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to Insforge PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err.message));

export const query = (text, params) => pool.query(text, params);
export default pool;
