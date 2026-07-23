const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../backend/server');
const { MemoryStore } = require('../backend/data/memoryStore');

async function request(base, path, options = {}, cookie = '') {
  const response = await fetch(base + path, { ...options, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(options.headers || {}) } });
  return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') };
}

test('full authenticated CRUD workflow and reports', async t => {
  const store = new MemoryStore();
  const server = createServer({ store, config: { sessionDays: 7, nodeEnv: 'test', dbMode: 'memory' } });
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const registered = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Demo User', email: 'demo@example.com', password: 'DemoPass1' }) });
  assert.equal(registered.status, 201);
  const cookie = registered.cookie.split(';')[0];

  const categories = await request(base, '/api/categories', {}, cookie);
  assert.equal(categories.status, 200);
  const expenseCategory = categories.body.categories.find(item => item.type === 'expense');

  const created = await request(base, '/api/transactions', { method: 'POST', body: JSON.stringify({ categoryId: expenseCategory.categoryId, amount: 25.5, transactionDate: '2026-07-20', description: 'Test purchase' }) }, cookie);
  assert.equal(created.status, 201);
  const id = created.body.transaction.transactionId;

  const updated = await request(base, `/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify({ categoryId: expenseCategory.categoryId, amount: 30, transactionDate: '2026-07-21', description: 'Updated purchase' }) }, cookie);
  assert.equal(updated.body.transaction.amount, 30);

  const summary = await request(base, '/api/reports/summary', {}, cookie);
  assert.equal(summary.body.summary.totalExpenses, 30);
  assert.equal(summary.body.summary.balance, -30);

  const deleted = await request(base, `/api/transactions/${id}`, { method: 'DELETE' }, cookie);
  assert.equal(deleted.status, 200);
  const list = await request(base, '/api/transactions', {}, cookie);
  assert.equal(list.body.transactions.length, 0);

  const loggedOut = await request(base, '/api/auth/logout', { method: 'POST', body: '{}' }, cookie);
  assert.equal(loggedOut.status, 200);
  const denied = await request(base, '/api/transactions', {}, cookie);
  assert.equal(denied.status, 401);
});

test('users cannot access another users transaction', async t => {
  const store = new MemoryStore();
  const server = createServer({ store, config: { sessionDays: 7, nodeEnv: 'test', dbMode: 'memory' } });
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const first = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'First User', email: 'first@example.com', password: 'FirstPass1' }) });
  const firstCookie = first.cookie.split(';')[0];
  const categories = await request(base, '/api/categories', {}, firstCookie);
  const created = await request(base, '/api/transactions', { method: 'POST', body: JSON.stringify({ categoryId: categories.body.categories[0].categoryId, amount: 100, transactionDate: '2026-07-20', description: 'Private' }) }, firstCookie);

  const second = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Second User', email: 'second@example.com', password: 'SecondPass1' }) });
  const secondCookie = second.cookie.split(';')[0];
  const forbidden = await request(base, `/api/transactions/${created.body.transaction.transactionId}`, {}, secondCookie);
  assert.equal(forbidden.status, 404);
});

test('custom category CRUD and category protection rules', async t => {
  const store = new MemoryStore();
  const server = createServer({ store, config: { sessionDays: 7, nodeEnv: 'test', dbMode: 'memory' } });
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const registered = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Category User', email: 'category@example.com', password: 'Category1A' }) });
  const cookie = registered.cookie.split(';')[0];
  const created = await request(base, '/api/categories', { method: 'POST', body: JSON.stringify({ name: 'Subscriptions', type: 'expense' }) }, cookie);
  assert.equal(created.status, 201);
  const categoryId = created.body.category.categoryId;

  const updated = await request(base, `/api/categories/${categoryId}`, { method: 'PUT', body: JSON.stringify({ name: 'Monthly Subscriptions', type: 'expense' }) }, cookie);
  assert.equal(updated.body.category.name, 'Monthly Subscriptions');

  const removed = await request(base, `/api/categories/${categoryId}`, { method: 'DELETE' }, cookie);
  assert.equal(removed.status, 200);

  const list = await request(base, '/api/categories', {}, cookie);
  const defaultCategory = list.body.categories.find(item => item.isDefault);
  const protectedDelete = await request(base, `/api/categories/${defaultCategory.categoryId}`, { method: 'DELETE' }, cookie);
  assert.equal(protectedDelete.status, 403);
});

test('filters and search return only matching transactions', async t => {
  const store = new MemoryStore();
  const server = createServer({ store, config: { sessionDays: 7, nodeEnv: 'test', dbMode: 'memory' } });
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const registered = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Filter User', email: 'filter@example.com', password: 'FilterPass1' }) });
  const cookie = registered.cookie.split(';')[0];
  const categories = await request(base, '/api/categories', {}, cookie);
  const income = categories.body.categories.find(item => item.type === 'income');
  const expense = categories.body.categories.find(item => item.type === 'expense');

  await request(base, '/api/transactions', { method: 'POST', body: JSON.stringify({ categoryId: income.categoryId, amount: 1000, transactionDate: '2026-07-01', description: 'Summer job' }) }, cookie);
  await request(base, '/api/transactions', { method: 'POST', body: JSON.stringify({ categoryId: expense.categoryId, amount: 50, transactionDate: '2026-07-10', description: 'Groceries' }) }, cookie);

  const typeResult = await request(base, '/api/transactions?type=expense', {}, cookie);
  assert.equal(typeResult.body.transactions.length, 1);
  assert.equal(typeResult.body.transactions[0].description, 'Groceries');

  const searchResult = await request(base, '/api/transactions?search=summer', {}, cookie);
  assert.equal(searchResult.body.transactions.length, 1);
  assert.equal(searchResult.body.transactions[0].type, 'income');

  const dateResult = await request(base, '/api/transactions?startDate=2026-07-05&endDate=2026-07-31', {}, cookie);
  assert.equal(dateResult.body.transactions.length, 1);
  assert.equal(dateResult.body.transactions[0].description, 'Groceries');
});

test('profile and password update invalidate old session', async t => {
  const store = new MemoryStore();
  const server = createServer({ store, config: { sessionDays: 7, nodeEnv: 'test', dbMode: 'memory' } });
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const registered = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Profile User', email: 'profile@example.com', password: 'ProfilePass1' }) });
  const cookie = registered.cookie.split(';')[0];

  const profile = await request(base, '/api/user/profile', { method: 'PUT', body: JSON.stringify({ fullName: 'Updated User', email: 'updated@example.com' }) }, cookie);
  assert.equal(profile.body.user.fullName, 'Updated User');

  const password = await request(base, '/api/user/password', { method: 'PUT', body: JSON.stringify({ currentPassword: 'ProfilePass1', newPassword: 'NewProfile2' }) }, cookie);
  assert.equal(password.status, 200);

  const denied = await request(base, '/api/user/profile', {}, cookie);
  assert.equal(denied.status, 401);

  const relogin = await request(base, '/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'updated@example.com', password: 'NewProfile2' }) });
  assert.equal(relogin.status, 200);
});

test('invalid data and duplicate accounts return clear errors', async t => {
  const store = new MemoryStore();
  const server = createServer({ store, config: { sessionDays: 7, nodeEnv: 'test', dbMode: 'memory' } });
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const first = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Duplicate User', email: 'duplicate@example.com', password: 'Duplicate1' }) });
  assert.equal(first.status, 201);
  const duplicate = await request(base, '/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: 'Second User', email: 'duplicate@example.com', password: 'Duplicate2' }) });
  assert.equal(duplicate.status, 409);

  const cookie = first.cookie.split(';')[0];
  const categories = await request(base, '/api/categories', {}, cookie);
  const category = categories.body.categories[0];
  const invalidAmount = await request(base, '/api/transactions', { method: 'POST', body: JSON.stringify({ categoryId: category.categoryId, amount: -5, transactionDate: '2026-07-20', description: 'Invalid' }) }, cookie);
  assert.equal(invalidAmount.status, 400);
});
