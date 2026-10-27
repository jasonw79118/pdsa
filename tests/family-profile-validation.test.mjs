import test from 'node:test';
import assert from 'node:assert/strict';
import { isIdempotencyKey, validateChildInput } from '../src/family-profile-validation.mjs';

test('accepts trimmed child name and valid past date of birth', () => {
  const result = validateChildInput({ firstName: '  Jamie ', lastName: ' Rivera ', dateOfBirth: '2016-02-29' });
  assert.deepEqual(result.value, { firstName: 'Jamie', lastName: 'Rivera', dateOfBirth: '2016-02-29' });
});

test('rejects unsupported fields, including client-supplied guardian ownership', () => {
  assert.match(validateChildInput({ firstName: 'Jamie', lastName: 'Rivera', dateOfBirth: '2016-02-29', guardianUserId: 'other' }).error, /unsupported/);
});

test('rejects malformed or impossible dates and future dates', () => {
  assert.match(validateChildInput({ firstName: 'Jamie', lastName: 'Rivera', dateOfBirth: '2019-02-29' }).error, /valid date/);
  assert.match(validateChildInput({ firstName: 'Jamie', lastName: 'Rivera', dateOfBirth: '2999-01-01' }).error, /future/);
});

test('rejects empty, oversized, and control-character names', () => {
  assert.match(validateChildInput({ firstName: ' ', lastName: 'Rivera', dateOfBirth: '2016-02-29' }).error, /first and last/);
  assert.match(validateChildInput({ firstName: 'A'.repeat(101), lastName: 'Rivera', dateOfBirth: '2016-02-29' }).error, /first and last/);
  assert.match(validateChildInput({ firstName: 'Ja\nme', lastName: 'Rivera', dateOfBirth: '2016-02-29' }).error, /first and last/);
});

test('accepts UUID idempotency keys and rejects arbitrary values', () => {
  assert.equal(isIdempotencyKey('8db132f4-71c2-4b6e-8f22-f74f66a34c02'), true);
  assert.equal(isIdempotencyKey('not-a-key'), false);
});
