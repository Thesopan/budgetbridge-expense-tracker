const test = require('node:test');
const assert = require('node:assert/strict');
const validation = require('../backend/utils/validation');

test('registration normalizes email and accepts strong password', () => {
  const result = validation.registration({ fullName: ' Test User ', email: 'TEST@Example.COM ', password: 'Strong123' });
  assert.equal(result.fullName, 'Test User');
  assert.equal(result.email, 'test@example.com');
});

test('weak password is rejected', () => {
  assert.throws(() => validation.registration({ fullName: 'User', email: 'u@example.com', password: 'weakpass' }), /uppercase letter/);
});

test('invalid transaction amount is rejected', () => {
  assert.throws(() => validation.transaction({ categoryId: 1, amount: 0, transactionDate: '2026-07-20', description: '' }), /positive number/);
});

test('invalid date range is rejected', () => {
  assert.throws(() => validation.filters({ startDate: '2026-07-20', endDate: '2026-07-01' }), /cannot be after/);
});
