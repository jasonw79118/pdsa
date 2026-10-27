export function validateChildInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Enter the child details.' };

  const allowed = new Set(['firstName', 'lastName', 'dateOfBirth']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { error: 'The request contains unsupported fields.' };

  const firstName = typeof input.firstName === 'string' ? input.firstName.trim() : '';
  const lastName = typeof input.lastName === 'string' ? input.lastName.trim() : '';
  const dateOfBirth = typeof input.dateOfBirth === 'string' ? input.dateOfBirth : '';
  const invalidName = (value) => !value || value.length > 100 || /[\u0000-\u001f\u007f]/u.test(value);

  if (invalidName(firstName) || invalidName(lastName)) return { error: 'Enter a first and last name (up to 100 characters each).' };
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(dateOfBirth)) return { error: 'Enter a valid date of birth.' };
  const timestamp = Date.parse(`${dateOfBirth}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== dateOfBirth) {
    return { error: 'Enter a valid date of birth.' };
  }
  if (timestamp > Date.now()) return { error: 'Date of birth cannot be in the future.' };

  return { value: { firstName, lastName, dateOfBirth } };
}

export function isIdempotencyKey(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value);
}
