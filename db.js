const { Pool } = require('pg');
require('dotenv').config();

// DATABASE_URL Render Environment Variables içinde tanımlı olmalı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ✅ Supabase için gerekli
  }
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL bağlantısı başarılı');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL bağlantı hatası:', err);
  process.exit(-1);
});

module.exports = pool;
