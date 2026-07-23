const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, createSessionToken, hashSessionToken } = require('../backend/utils/security');

test('password hash verifies only the correct password', async () => {
  const hash = await hashPassword('Strong123');
  assert.equal(await verifyPassword('Strong123', hash), true);
  assert.equal(await verifyPassword('Wrong123', hash), false);
  assert.notEqual(hash, 'Strong123');
});

test('session tokens are random and stored as hashes', () => {
  const first = createSessionToken();
  const second = createSessionToken();
  assert.notEqual(first, second);
  assert.equal(hashSessionToken(first).length, 64);
  assert.notEqual(hashSessionToken(first), first);
});
