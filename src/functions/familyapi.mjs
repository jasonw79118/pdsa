import { attachDatabasePool } from '@neon/functions';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import pg from 'pg';
import { isIdempotencyKey, validateChildInput } from '../family-profile-validation.mjs';

const { Pool } = pg;
const familyDatabaseUrl = process.env.FAMILY_API_DATABASE_URL;
const pool = new Pool({ connectionString: familyDatabaseUrl, max: 5 });
attachDatabasePool(pool);

const authBaseUrl = process.env.AUTH_BASE_URL || process.env.NEON_AUTH_BASE_URL;
const jwksUrl = process.env.AUTH_JWKS_URL || process.env.NEON_AUTH_JWKS_URL;
if (!authBaseUrl || !jwksUrl || !familyDatabaseUrl) {
  throw new Error('Family API requires Auth verification and a restricted database role.');
}
const jwks = createRemoteJWKSet(new URL(jwksUrl));
const issuer = new URL(authBaseUrl).origin;
const allowedOrigins = new Set((process.env.APP_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));

function responseHeaders(request) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key',
  });
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request) });
}

async function authenticate(request) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.toLowerCase().startsWith('bearer ')) return null;
  try {
    const { payload } = await jwtVerify(authorization.slice(7), jwks, { issuer });
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch (error) {
    console.warn('Family API rejected bearer token:', error?.code || error?.name || 'verification_error');
    return null;
  }
}

async function withGuardianContext(guardianUserId, callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('pdsa.guardian_user_id', $1, true)", [guardianUserId]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default {
  async fetch(request) {
    const headers = responseHeaders(request);
    const origin = request.headers.get('origin');
    if (origin && !allowedOrigins.has(origin)) return json(request, { error: 'Origin is not allowed.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    const guardianUserId = await authenticate(request);
    if (!guardianUserId) return json(request, { error: 'Sign in to access your family profile.' }, 401);

    const path = new URL(request.url).pathname.replace(/\/+$/u, '') || '/';
    if (path === '/children' && request.method === 'GET') {
      try {
        const children = await withGuardianContext(guardianUserId, async (client) => {
          const result = await client.query(
            `SELECT id, first_name AS "firstName", last_name AS "lastName", date_of_birth AS "dateOfBirth"
             FROM public.pdsa_family_children
             WHERE guardian_user_id = $1
             ORDER BY created_at ASC, id ASC`,
            [guardianUserId],
          );
          return result.rows;
        });
        return json(request, { children });
      } catch {
        return json(request, { error: 'Family profiles are temporarily unavailable.' }, 503);
      }
    }

    if (path === '/children' && request.method === 'POST') {
      const contentLength = Number(request.headers.get('content-length') || 0);
      if (contentLength > 4096) return json(request, { error: 'Request is too large.' }, 413);

      let input;
      try { input = await request.json(); } catch { return json(request, { error: 'Invalid request body.' }, 400); }
      const checked = validateChildInput(input);
      if (checked.error) return json(request, { error: checked.error }, 400);
      const requestKey = request.headers.get('idempotency-key');
      if (!isIdempotencyKey(requestKey)) return json(request, { error: 'A valid request key is required.' }, 400);

      try {
        const child = await withGuardianContext(guardianUserId, async (client) => {
          const result = await client.query(
            `WITH inserted AS (
               INSERT INTO public.pdsa_family_children
                 (guardian_user_id, first_name, last_name, date_of_birth, request_key)
               VALUES ($1, $2, $3, $4::date, $5::uuid)
               ON CONFLICT (guardian_user_id, request_key) DO NOTHING
               RETURNING id, first_name AS "firstName", last_name AS "lastName", date_of_birth AS "dateOfBirth"
             )
             SELECT * FROM inserted
             UNION ALL
             SELECT id, first_name AS "firstName", last_name AS "lastName", date_of_birth AS "dateOfBirth"
             FROM public.pdsa_family_children
             WHERE guardian_user_id = $1 AND request_key = $5::uuid
               AND NOT EXISTS (SELECT 1 FROM inserted)
             LIMIT 1`,
            [guardianUserId, checked.value.firstName, checked.value.lastName, checked.value.dateOfBirth, requestKey],
          );
          return result.rows[0];
        });
        if (!child) return json(request, { error: 'Could not save this child profile.' }, 500);
        return json(request, { child }, 201);
      } catch {
        return json(request, { error: 'Could not save this child profile.' }, 500);
      }
    }

    return json(request, { error: 'Not found.' }, 404);
  },
};
