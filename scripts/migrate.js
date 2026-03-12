#!/usr/bin/env node
/**
 * Migration script - Run: node scripts/migrate.js
 * Reads schema.sql and runs it against the database
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🗄️  Running migrations...');
    const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Migrations completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
