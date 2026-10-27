import { readFile } from 'node:fs/promises';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (process.env.NEON_BRANCH !== 'family-child-dev') {
  throw new Error('Refusing to apply the child-profile migration outside family-child-dev.');
}
if (!connectionString) throw new Error('DATABASE_URL_UNPOOLED is required for applying migrations.');

const migration = await readFile(new URL('../db/migrations/001_pdsa_family_children.sql', import.meta.url), 'utf8');
const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
try {
  await pool.query(migration);
  console.log('Applied PDSA family-children schema migration.');
} finally {
  await pool.end();
}
