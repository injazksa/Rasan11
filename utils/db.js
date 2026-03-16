import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: 'rasan_user',
  host: 'localhost',
  database: 'rasan',
  password: 'rasan_pass',
  port: 5432,
  ssl: isProduction ? {
    rejectUnauthorized: false // Required for Render's managed PostgreSQL
  } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
