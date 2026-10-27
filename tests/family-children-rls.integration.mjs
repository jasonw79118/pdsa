import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

test('PDSA child profiles are isolated by guardian user id under forced RLS', async (context) => {
  if (process.env.NEON_BRANCH !== 'family-child-dev') {
    context.skip('Run only against the isolated family-child-dev branch.');
    return;
  }
  assert.ok(process.env.FAMILY_API_DATABASE_URL, 'restricted development API role is required');
  const pool = new pg.Pool({ connectionString: process.env.FAMILY_API_DATABASE_URL, max: 1 });
  const client = await pool.connect();
  const guardianA = `rls-test-a-${randomUUID()}`;
  const guardianB = `rls-test-b-${randomUUID()}`;
  const childId = randomUUID();
  try {
    await client.query('BEGIN');
    const role = await client.query("SELECT r.rolsuper, r.rolbypassrls FROM pg_roles r WHERE r.rolname = current_user");
    assert.equal(role.rows[0].rolsuper, false, 'API DB role is not a superuser');
    assert.equal(role.rows[0].rolbypassrls, false, 'API DB role cannot bypass row-level security');
    await client.query("SELECT set_config('pdsa.guardian_user_id', $1, true)", [guardianA]);
    await client.query(
      `INSERT INTO public.pdsa_family_children
       (id, guardian_user_id, first_name, last_name, date_of_birth, request_key)
       VALUES ($1, $2, 'Fictional', 'Testchild', '2015-01-01', $3)`,
      [childId, guardianA, randomUUID()],
    );

    await client.query("SELECT set_config('pdsa.guardian_user_id', $1, true)", [guardianB]);
    const hidden = await client.query('SELECT id FROM public.pdsa_family_children WHERE id = $1', [childId]);
    assert.equal(hidden.rowCount, 0, 'another guardian cannot read the profile');
    await client.query('SAVEPOINT denied_update');
    await assert.rejects(
      client.query("UPDATE public.pdsa_family_children SET first_name = 'Tampered' WHERE id = $1", [childId]),
      (error) => error.code === '42501',
      'the API role cannot update child records outside the approved endpoint',
    );
    await client.query('ROLLBACK TO SAVEPOINT denied_update');

    await client.query('SAVEPOINT cross_guardian_insert');
    await assert.rejects(
      client.query(
        `INSERT INTO public.pdsa_family_children
         (guardian_user_id, first_name, last_name, date_of_birth, request_key)
         VALUES ($1, 'Fictional', 'Denied', '2015-01-01', $2)`,
        [guardianA, randomUUID()],
      ),
      (error) => error.code === '42501',
      'a caller cannot insert on behalf of another guardian',
    );
    await client.query('ROLLBACK TO SAVEPOINT cross_guardian_insert');

    await client.query("SELECT set_config('pdsa.guardian_user_id', $1, true)", [guardianA]);
    const visible = await client.query('SELECT id FROM public.pdsa_family_children WHERE id = $1', [childId]);
    assert.equal(visible.rowCount, 1, 'the creating guardian can read their profile');
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
