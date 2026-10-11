/**
 * Database setup script — runs each SQL statement individually.
 * Run: node src/setup-db.js
 */
require('dotenv').config();
const mysql2 = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/** Split SQL into individual runnable statements, skipping comments/blank */
function splitSQL(sql) {
  // Remove block comments
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments
  sql = sql.replace(/--[^\n]*/g, '');
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function setup() {
  const dbName = process.env.DB_NAME || 'maligai_assistant';
  const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  const connConfig = process.env.DATABASE_URL
    ? { uri: process.env.DATABASE_URL, ssl: sslConfig, charset: 'utf8mb4' }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DATABASE_URL ? undefined : dbName,
        charset: 'utf8mb4',
        ssl: sslConfig,
      };

  const conn = await mysql2.createConnection(connConfig);
  console.log('✅ Connected to MySQL');

  // Try creating database if permission allows
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready`);
  } catch (e) {
    // Hosted cloud databases often already have the database assigned
    try { await conn.query(`USE \`${dbName}\``); } catch (_) {}
    console.log(`ℹ️  Using existing database connection`);
  }

  // Run schema
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    let schema = fs.readFileSync(schemaPath, 'utf8');
    // Strip DB-level statements (already handled above)
    schema = schema.replace(/CREATE DATABASE[^;]+;/gi, '');
    schema = schema.replace(/USE\s+[^;]+;/gi, '');
    const stmts = splitSQL(schema);
    for (const stmt of stmts) {
      await conn.query(stmt);
    }
    console.log('✅ Schema tables created');
  }

  // Create admin user
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('admin123', 10);
  const [existing] = await conn.query('SELECT id FROM users WHERE username = ?', ['admin']);
  if (existing.length === 0) {
    await conn.query(
      'INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)',
      ['admin', hash, 'Shop Owner']
    );
    console.log('✅ Admin user created  →  username: admin | password: admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Seed products if table is empty
  const [cnt] = await conn.query('SELECT COUNT(*) AS cnt FROM products');
  if (cnt[0].cnt === 0) {
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      let seed = fs.readFileSync(seedPath, 'utf8');
      seed = seed.replace(/USE\s+[^;]+;/gi, '');
      seed = seed.replace(/INSERT INTO users[^;]+;/gis, '');
      const seedStmts = splitSQL(seed);
      for (const stmt of seedStmts) {
        await conn.query(stmt);
      }
      console.log('✅ Sample grocery data seeded (40+ products)');
    }
  } else {
    console.log(`ℹ️  ${cnt[0].cnt} products already exist — skipping seed`);
  }

  await conn.end();
  console.log('\n🎉 Database setup complete!');
  console.log('   Login credentials → admin / admin123');
  console.log('   Start server     → npm run dev\n');
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  console.error('\nCheck:');
  console.error('  1. DB_PASSWORD in server/.env');
  console.error('  2. MySQL is running (check Services / XAMPP)');
  process.exit(1);
});
