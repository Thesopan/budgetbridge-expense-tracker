'use strict';

const state = { user: null, categories: [], pendingDeleteId: null };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function currency(value) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(Number(value || 0));
}

function setMessage(element, message = '', type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `message${type ? ` ${type}` : ''}`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function session() {
  const payload = await api('/api/auth/session');
  return payload.authenticated ? payload.user : null;
}

function updateUserLabels() {
  $$('[data-user-name]').forEach(element => { element.textContent = state.user?.fullName || 'User'; });
}

function createCell(text, className = '') {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function badge(type) {
  const span = document.createElement('span');
  span.className = `badge ${type}`;
  span.textContent = type === 'income' ? 'Income' : 'Expense';
  return span;
}

function transactionRow(item, actions = false) {
  const row = document.createElement('tr');
  row.append(createCell(item.transactionDate), createCell(item.description || '-'), createCell(item.categoryName));
  const typeCell = document.createElement('td');
  typeCell.append(badge(item.type));
  row.append(typeCell, createCell(currency(item.amount), item.type === 'income' ? 'amount-income' : 'amount-expense'));
  if (actions) {
    const actionCell = document.createElement('td');
    const edit = document.createElement('a');
    edit.className = 'icon-btn'; edit.textContent = 'Edit'; edit.href = `edit-transaction.html?id=${item.transactionId}`;
    const remove = document.createElement('button');
    remove.className = 'icon-btn danger'; remove.type = 'button'; remove.textContent = 'Delete';
    remove.addEventListener('click', () => openDeleteModal(item.transactionId));
    actionCell.append(edit, document.createTextNode(' '), remove);
    row.append(actionCell);
  }
  return row;
}

async function loadCategories() {
  const payload = await api('/api/categories');
  state.categories = payload.categories;
  return state.categories;
}

function populateCategorySelect(select, includeAll = false) {
  if (!select) return;
  select.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = includeAll ? 'all' : '';
  placeholder.textContent = includeAll ? 'All Categories' : 'Select a category';
  select.append(placeholder);
  const groups = { income: document.createElement('optgroup'), expense: document.createElement('optgroup') };
  groups.income.label = 'Income'; groups.expense.label = 'Expense';
  for (const category of state.categories) {
    const option = document.createElement('option');
    option.value = category.categoryId;
    option.textContent = category.name;
    option.dataset.type = category.type;
    groups[category.type].append(option);
  }
  select.append(groups.income, groups.expense);
}

async function initLogin() {
  if (await session()) return location.replace('dashboard.html');
  $('#loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const message = $('#authMessage'); setMessage(message);
    try {
      await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('#email').value, password: $('#password').value }) });
      location.href = 'dashboard.html';
    } catch (error) { setMessage(message, error.message, 'error'); }
  });
}

async function initRegister() {
  if (await session()) return location.replace('dashboard.html');
  $('#registerForm').addEventListener('submit', async event => {
    event.preventDefault();
    const message = $('#authMessage'); setMessage(message);
    if ($('#password').value !== $('#confirmPassword').value) return setMessage(message, 'Passwords do not match.', 'error');
    try {
      await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName: $('#fullName').value, email: $('#email').value, password: $('#password').value }) });
      location.href = 'dashboard.html';
    } catch (error) { setMessage(message, error.message, 'error'); }
  });
}

async function initDashboard() {
  const message = $('#dashboardMessage');
  try {
    const { summary } = await api('/api/reports/summary');
    $('#totalIncome').textContent = currency(summary.totalIncome);
    $('#totalExpenses').textContent = currency(summary.totalExpenses);
    $('#balance').textContent = currency(summary.balance);
    const body = $('#recentTransactions'); body.replaceChildren();
    if (!summary.recentTransactions.length) {
      const row = document.createElement('tr'); const cell = createCell('No transactions yet. Add your first transaction.', 'empty-state'); cell.colSpan = 5; row.append(cell); body.append(row);
    } else summary.recentTransactions.forEach(item => body.append(transactionRow(item)));
  } catch (error) { setMessage(message, error.message, 'error'); }
}

async function loadTransactions() {
  const params = new URLSearchParams();
  const values = { type: $('#typeFilter')?.value, categoryId: $('#categoryFilter')?.value, startDate: $('#startDate')?.value, endDate: $('#endDate')?.value, search: $('#searchFilter')?.value.trim() };
  Object.entries(values).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
  const payload = await api(`/api/transactions?${params}`);
  const body = $('#transactionTableBody'); body.replaceChildren();
  $('#transactionCount').textContent = `${payload.transactions.length} record${payload.transactions.length === 1 ? '' : 's'}`;
  if (!payload.transactions.length) {
    const row = document.createElement('tr'); const cell = createCell('No transactions match the selected filters.', 'empty-state'); cell.colSpan = 6; row.append(cell); body.append(row);
  } else payload.transactions.forEach(item => body.append(transactionRow(item, true)));
}

function openDeleteModal(id) { state.pendingDeleteId = id; $('#deleteModal').classList.add('open'); $('#deleteModal').setAttribute('aria-hidden', 'false'); }
function closeDeleteModal() { state.pendingDeleteId = null; $('#deleteModal').classList.remove('open'); $('#deleteModal').setAttribute('aria-hidden', 'true'); }

async function initTransactions() {
  const message = $('#transactionMessage');
  try { await loadCategories(); populateCategorySelect($('#categoryFilter'), true); await loadTransactions(); }
  catch (error) { setMessage(message, error.message, 'error'); }
  $('#filterForm').addEventListener('submit', async event => { event.preventDefault(); try { setMessage(message); await loadTransactions(); } catch (error) { setMessage(message, error.message, 'error'); } });
  $('#resetFilters').addEventListener('click', async () => { $('#filterForm').reset(); await loadTransactions(); });
  $('#cancelDelete').addEventListener('click', closeDeleteModal);
  $('#confirmDelete').addEventListener('click', async () => {
    try { await api(`/api/transactions/${state.pendingDeleteId}`, { method: 'DELETE' }); closeDeleteModal(); setMessage(message, 'Transaction deleted.', 'success'); await loadTransactions(); }
    catch (error) { closeDeleteModal(); setMessage(message, error.message, 'error'); }
  });
}

function updateTypePreview() {
  const select = $('#category'); const option = select?.selectedOptions[0];
  const type = option?.dataset.type;
  $('#selectedType').textContent = type ? `This will be saved as ${type}.` : 'Choose a category to determine income or expense.';
}

async function initTransactionForm(isEdit) {
  const message = $('#formMessage');
  try {
    await loadCategories(); populateCategorySelect($('#category'));
    $('#category').addEventListener('change', updateTypePreview);
    if (isEdit) {
      const id = new URLSearchParams(location.search).get('id');
      if (!id) throw new Error('Transaction ID is missing.');
      const { transaction } = await api(`/api/transactions/${id}`);
      $('#amount').value = transaction.amount; $('#category').value = transaction.categoryId; $('#date').value = transaction.transactionDate; $('#description').value = transaction.description || ''; updateTypePreview();
    } else $('#date').value = new Date().toISOString().slice(0, 10);
  } catch (error) { setMessage(message, error.message, 'error'); }

  $('#transactionForm').addEventListener('submit', async event => {
    event.preventDefault(); setMessage(message);
    const data = { amount: $('#amount').value, categoryId: $('#category').value, transactionDate: $('#date').value, description: $('#description').value };
    try {
      if (isEdit) {
        const id = new URLSearchParams(location.search).get('id');
        await api(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else await api('/api/transactions', { method: 'POST', body: JSON.stringify(data) });
      location.href = 'transactions.html';
    } catch (error) { setMessage(message, error.message, 'error'); }
  });
}

function categoryItem(category) {
  const item = document.createElement('div'); item.className = 'category-item';
  const details = document.createElement('div'); const name = document.createElement('strong'); name.textContent = category.name; const note = document.createElement('small'); note.textContent = category.isDefault ? 'Default category' : 'Custom category'; details.append(name, note);
  const type = badge(category.type);
  const actions = document.createElement('div'); actions.className = 'category-actions';
  const edit = document.createElement('button'); edit.className = 'icon-btn'; edit.type = 'button'; edit.textContent = 'Edit'; edit.disabled = category.isDefault; edit.addEventListener('click', () => openCategoryEdit(category));
  const remove = document.createElement('button'); remove.className = 'icon-btn danger'; remove.type = 'button'; remove.textContent = 'Delete'; remove.disabled = category.isDefault; remove.addEventListener('click', () => deleteCategory(category.categoryId));
  actions.append(edit, remove); item.append(details, type, actions); return item;
}

async function renderCategories() { await loadCategories(); const list = $('#categoryList'); list.replaceChildren(); state.categories.forEach(category => list.append(categoryItem(category))); }
function openCategoryEdit(category) { $('#editCategoryId').value = category.categoryId; $('#editCategoryName').value = category.name; $('#editCategoryType').value = category.type; $('#categoryModal').classList.add('open'); }
function closeCategoryEdit() { $('#categoryModal').classList.remove('open'); }
async function deleteCategory(id) { const message = $('#categoryMessage'); if (!confirm('Delete this custom category?')) return; try { await api(`/api/categories/${id}`, { method: 'DELETE' }); setMessage(message, 'Category deleted.', 'success'); await renderCategories(); } catch (error) { setMessage(message, error.message, 'error'); } }

async function initCategories() {
  const message = $('#categoryMessage');
  try { await renderCategories(); } catch (error) { setMessage(message, error.message, 'error'); }
  $('#categoryForm').addEventListener('submit', async event => { event.preventDefault(); try { await api('/api/categories', { method: 'POST', body: JSON.stringify({ name: $('#newCategory').value, type: $('#categoryType').value }) }); event.target.reset(); setMessage(message, 'Category created.', 'success'); await renderCategories(); } catch (error) { setMessage(message, error.message, 'error'); } });
  $('#cancelCategoryEdit').addEventListener('click', closeCategoryEdit);
  $('#editCategoryForm').addEventListener('submit', async event => { event.preventDefault(); try { await api(`/api/categories/${$('#editCategoryId').value}`, { method: 'PUT', body: JSON.stringify({ name: $('#editCategoryName').value, type: $('#editCategoryType').value }) }); closeCategoryEdit(); setMessage(message, 'Category updated.', 'success'); await renderCategories(); } catch (error) { closeCategoryEdit(); setMessage(message, error.message, 'error'); } });
}

async function generateReport() {
  const message = $('#reportMessage'); const params = new URLSearchParams();
  if ($('#reportStart').value) params.set('startDate', $('#reportStart').value); if ($('#reportEnd').value) params.set('endDate', $('#reportEnd').value);
  try {
    const { summary } = await api(`/api/reports/summary?${params}`);
    $('#reportIncome').textContent = currency(summary.totalIncome); $('#reportExpenses').textContent = currency(summary.totalExpenses); $('#reportBalance').textContent = currency(summary.balance);
    const list = $('#categoryReport'); list.replaceChildren(); const max = Math.max(...summary.byCategory.map(item => Number(item.total)), 1);
    if (!summary.byCategory.length) { const empty = document.createElement('p'); empty.textContent = 'No expense data is available for this date range.'; list.append(empty); }
    else summary.byCategory.forEach(item => { const row = document.createElement('div'); row.className = 'report-row'; const label = document.createElement('strong'); label.textContent = item.categoryName; const bar = document.createElement('div'); bar.className = 'report-bar'; const fill = document.createElement('span'); fill.style.width = `${Math.max(4, Number(item.total) / max * 100)}%`; bar.append(fill); const amount = document.createElement('span'); amount.textContent = currency(item.total); row.append(label, bar, amount); list.append(row); });
    setMessage(message);
  } catch (error) { setMessage(message, error.message, 'error'); }
}

async function initReports() { await generateReport(); $('#reportForm').addEventListener('submit', event => { event.preventDefault(); generateReport(); }); }

async function initSettings() {
  const profileMessage = $('#profileMessage'), passwordMessage = $('#passwordMessage');
  const { user } = await api('/api/user/profile'); $('#settingsName').value = user.fullName; $('#settingsEmail').value = user.email;
  $('#profileForm').addEventListener('submit', async event => { event.preventDefault(); try { const result = await api('/api/user/profile', { method: 'PUT', body: JSON.stringify({ fullName: $('#settingsName').value, email: $('#settingsEmail').value }) }); state.user = result.user; updateUserLabels(); setMessage(profileMessage, result.message, 'success'); } catch (error) { setMessage(profileMessage, error.message, 'error'); } });
  $('#passwordForm').addEventListener('submit', async event => { event.preventDefault(); if ($('#newPassword').value !== $('#confirmNewPassword').value) return setMessage(passwordMessage, 'New passwords do not match.', 'error'); try { const result = await api('/api/user/password', { method: 'PUT', body: JSON.stringify({ currentPassword: $('#currentPassword').value, newPassword: $('#newPassword').value }) }); setMessage(passwordMessage, result.message, 'success'); setTimeout(() => location.href = 'index.html', 1200); } catch (error) { setMessage(passwordMessage, error.message, 'error'); } });
}

async function logout() { try { await api('/api/auth/logout', { method: 'POST', body: '{}' }); } finally { location.href = 'index.html'; } }

async function initialize() {
  const page = document.body.dataset.page;
  try {
    if (document.body.dataset.protected === 'true') {
      state.user = await session();
      if (!state.user) return location.replace('index.html');
      updateUserLabels();
    }
    $$('[data-action="logout"]').forEach(button => button.addEventListener('click', logout));
    $$('[data-action="menu"]').forEach(button => button.addEventListener('click', () => $('#sidebar')?.classList.toggle('open')));
    const initializers = { login:initLogin, register:initRegister, dashboard:initDashboard, transactions:initTransactions, 'add-transaction':() => initTransactionForm(false), 'edit-transaction':() => initTransactionForm(true), categories:initCategories, reports:initReports, settings:initSettings };
    if (initializers[page]) await initializers[page]();
  } catch (error) {
    if (error.status === 401 && document.body.dataset.protected === 'true') return location.replace('index.html');
    console.error(error);
    const target = $('.message'); if (target) setMessage(target, error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialize);
