import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import pg from 'pg';

if (process.env.NEON_BRANCH !== 'family-child-dev') {
  throw new Error('Refusing to create the restricted role outside family-child-dev.');
}
if (!process.env.DATABASE_URL_UNPOOLED || !process.env.DATABASE_URL) {
  throw new Error('Pull the development branch Postgres environment before running this script.');
}

const password = randomBytes(36).toString('base64url');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED, max: 1 });
try {
  const roleExists = await pool.query("SELECT 1 FROM pg_roles WHERE rolname = 'pdsa_family_api'");
  const statement = roleExists.rowCount
    ? "SELECT format('ALTER ROLE pdsa_family_api WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS', $1::text) AS sql"
    : "SELECT format('CREATE ROLE pdsa_family_api LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS', $1::text) AS sql";
  const sql = await pool.query(statement, [password]);
  await pool.query(sql.rows[0].sql);
  await pool.query('GRANT CONNECT ON DATABASE neondb TO pdsa_family_api');
  await pool.query('GRANT USAGE ON SCHEMA public TO pdsa_family_api');
  await pool.query('GRANT SELECT, INSERT ON public.pdsa_family_children TO pdsa_family_api');
} finally {
  await pool.end();
}

const url = new URL(process.env.DATABASE_URL);
url.username = 'pdsa_family_api';
url.password = password;
const envPath = new URL('../.env.local', import.meta.url);
let envText = await readFile(envPath, 'utf8');
const assignment = `FAMILY_API_DATABASE_URL=${url.toString()}`;
if (/^FAMILY_API_DATABASE_URL=/mu.test(envText)) {
  envText = envText.replace(/^FAMILY_API_DATABASE_URL=.*$/mu, assignment);
} else {
  envText = `${envText.replace(/\s*$/u, '')}\n${assignment}\n`;
}
await writeFile(envPath, envText, 'utf8');

console.log('Created a NOSUPERUSER, NOBYPASSRLS role with only CONNECT, schema USAGE, and child-profile SELECT/INSERT grants. Stored its branch-specific connection string in ignored .env.local; no credential value printed.');
