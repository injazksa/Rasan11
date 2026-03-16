import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// استخدام DATABASE_URL في حالة توفره (وهو ما يوفره Render تلقائياً)
// وإلا استخدام البيانات التي قدمتها كقيم افتراضية
const connectionString = process.env.DATABASE_URL || 'postgresql://rasan_db_user:Gb9t4DQT641DfD2CqCvGssdBieSoR8e5@dpg-d6rl1g0gjchc73bbuhk0-a.oregon-postgres.render.com/rasan_db';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // مطلوب للاتصال بقواعد بيانات Render
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
