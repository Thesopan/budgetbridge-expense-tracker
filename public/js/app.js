const DEFAULT_TRANSACTIONS = [
  { id: 1, date: '2026-06-12', description: 'Paycheque', category: 'Income', type: 'income', amount: 1250.00 },
  { id: 2, date: '2026-06-10', description: 'Rent payment', category: 'Rent', type: 'expense', amount: 820.00 },
  { id: 3, date: '2026-06-09', description: 'Groceries', category: 'Food', type: 'expense', amount: 64.25 },
  { id: 4, date: '2026-06-08', description: 'Bus and train pass', category: 'Transportation', type: 'expense', amount: 35.50 },
  { id: 5, date: '2026-06-06', description: 'Textbook purchase', category: 'School', type: 'expense', amount: 92.00 },
  { id: 6, date: '2026-06-03', description: 'Part-time shift', category: 'Income', type: 'income', amount: 310.00 },
  { id: 7, date: '2026-06-02', description: 'Coffee with friends', category: 'Entertainment', type: 'expense', amount: 14.75 }
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Income', type: 'income' },
  { id: 2, name: 'Food', type: 'expense' },
  { id: 3, name: 'Rent', type: 'expense' },
  { id: 4, name: 'Transportation', type: 'expense' },
  { id: 5, name: 'School', type: 'expense' },
  { id: 6, name: 'Entertainment', type: 'expense' },
  { id: 7, name: 'Other', type: 'expense' }
];

function getData(key, fallback) {
  const value = localStorage.getItem(key);
  if (!value) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return [...fallback];
  }
  try { return JSON.parse(value); } catch { return [...fallback]; }
}

function saveData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function transactions() { return getData('bb_transactions', DEFAULT_TRANSACTIONS); }
function categories() { return getData('bb_categories', DEFAULT_CATEGORIES); }
function money(value) { return '$' + Number(value || 0).toFixed(2); }
function nextId(items) { return items.length ? Math.max(...items.map(item => Number(item.id))) + 1 : 1; }
function qs(name) { return new URLSearchParams(window.location.search).get(name); }

function initAuth() {
  const loginForm = document.querySelector('#loginForm');
  const registerForm = document.querySelector('#registerForm');
  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();
      const error = document.querySelector('#authMessage');
      if (!email.includes('@') || password.length < 4) {
        error.textContent = 'Enter a valid email and a password with at least 4 characters.';
        return;
      }
      localStorage.setItem('bb_user', JSON.stringify({ fullName: 'BudgetBridge User', email }));
      window.location.href = 'dashboard.html';
    });
  }
  if (registerForm) {
    registerForm.addEventListener('submit', event => {
      event.preventDefault();
      const fullName = document.querySelector('#fullName').value.trim();
      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value;
      const confirmPassword = document.querySelector('#confirmPassword').value;
      const message = document.querySelector('#authMessage');
      if (!fullName || !email.includes('@') || password.length < 6 || password !== confirmPassword) {
        message.textContent = 'Check that all fields are valid and both passwords match.';
        return;
      }
      localStorage.setItem('bb_user', JSON.stringify({ fullName, email }));
      window.location.href = 'dashboard.html';
    });
  }
}

function logout() {
  localStorage.removeItem('bb_user');
  window.location.href = 'index.html';
}

function dashboard() {
  const totalIncomeEl = document.querySelector('#totalIncome');
  if (!totalIncomeEl) return;
  const data = transactions();
  const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  totalIncomeEl.textContent = money(income);
  document.querySelector('#totalExpenses').textContent = money(expenses);
  document.querySelector('#balance').textContent = money(income - expenses);
  renderRows('#recentTransactions', data.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,5));
}

function renderRows(target, rows) {
  const body = document.querySelector(target);
  if (!body) return;
  body.innerHTML = rows.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.category}</td>
      <td><span class="badge badge-${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</span></td>
      <td class="amount-${t.type}">${t.type === 'income' ? '+' : '-'}${money(t.amount)}</td>
      <td class="actions">
        <a class="btn btn-secondary btn-small" href="edit-transaction.html?id=${t.id}">Edit</a>
        <button class="btn btn-danger btn-small" onclick="openDeleteModal(${t.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function populateCategoryOptions() {
  document.querySelectorAll('select[data-categories]').forEach(select => {
    const current = select.dataset.current || select.value;
    const all = categories();
    const prefix = select.dataset.includeAll === 'true' ? '<option value="">All Categories</option>' : '<option value="">Select category</option>';
    select.innerHTML = prefix + all.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    if (current) select.value = current;
  });
}

function initTransactionsPage() {
  const table = document.querySelector('#transactionsTable');
  if (!table) return;
  populateCategoryOptions();
  const apply = document.querySelector('#applyFilters');
  const reset = document.querySelector('#resetFilters');
  const render = () => {
    let rows = transactions();
    const type = document.querySelector('#filterType').value;
    const category = document.querySelector('#filterCategory').value;
    const start = document.querySelector('#startDate').value;
    const end = document.querySelector('#endDate').value;
    const search = document.querySelector('#search').value.trim().toLowerCase();
    if (type) rows = rows.filter(t => t.type === type);
    if (category) rows = rows.filter(t => t.category === category);
    if (start) rows = rows.filter(t => t.date >= start);
    if (end) rows = rows.filter(t => t.date <= end);
    if (search) rows = rows.filter(t => `${t.description} ${t.category}`.toLowerCase().includes(search));
    rows.sort((a, b) => b.date.localeCompare(a.date));
    renderRows('#transactionsTable', rows);
    document.querySelector('#transactionCount').textContent = rows.length;
  };
  apply.addEventListener('click', render);
  reset.addEventListener('click', () => {
    document.querySelector('#filterType').value = '';
    document.querySelector('#filterCategory').value = '';
    document.querySelector('#startDate').value = '';
    document.querySelector('#endDate').value = '';
    document.querySelector('#search').value = '';
    render();
  });
  render();
}

function initTransactionForm() {
  const form = document.querySelector('#transactionForm');
  if (!form) return;
  populateCategoryOptions();
  const editId = qs('id');
  if (editId) {
    const item = transactions().find(t => String(t.id) === editId);
    if (item) {
      document.querySelector(`input[name="type"][value="${item.type}"]`).checked = true;
      document.querySelector('#amount').value = item.amount;
      document.querySelector('#category').value = item.category;
      document.querySelector('#date').value = item.date;
      document.querySelector('#description').value = item.description;
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = Number(document.querySelector('#amount').value);
    const category = document.querySelector('#category').value;
    const date = document.querySelector('#date').value;
    const description = document.querySelector('#description').value.trim() || 'No description';
    const message = document.querySelector('#formMessage');
    if (!amount || amount <= 0 || !category || !date) {
      message.className = 'error-text';
      message.textContent = 'Amount must be positive, and category/date are required.';
      return;
    }
    const data = transactions();
    if (editId) {
      const index = data.findIndex(t => String(t.id) === editId);
      if (index !== -1) data[index] = { id: Number(editId), type, amount, category, date, description };
    } else {
      data.push({ id: nextId(data), type, amount, category, date, description });
    }
    saveData('bb_transactions', data);
    message.className = 'success-text';
    message.textContent = 'Transaction saved. Redirecting...';
    setTimeout(() => window.location.href = 'transactions.html', 600);
  });
}

let pendingDeleteId = null;
function openDeleteModal(id) {
  pendingDeleteId = id;
  document.querySelector('#deleteModal').classList.add('show');
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.querySelector('#deleteModal').classList.remove('show');
}
function confirmDelete() {
  if (pendingDeleteId !== null) {
    const remaining = transactions().filter(t => t.id !== pendingDeleteId);
    saveData('bb_transactions', remaining);
  }
  closeDeleteModal();
  initTransactionsPage();
  dashboard();
}

function initCategories() {
  const list = document.querySelector('#categoryList');
  if (!list) return;
  const render = () => {
    const all = categories();
    list.innerHTML = all.map(c => `
      <div class="category-item">
        <div class="category-info"><span class="dot"></span><strong>${c.name}</strong><span class="badge badge-${c.type}">${c.type}</span></div>
        <div class="actions"><button class="btn btn-secondary btn-small">Edit</button><button class="btn btn-secondary btn-small">View</button></div>
      </div>
    `).join('');
  };
  document.querySelector('#categoryForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#newCategory').value.trim();
    const type = document.querySelector('#categoryType').value;
    if (!name) return;
    const all = categories();
    if (!all.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      all.push({ id: nextId(all), name, type });
      saveData('bb_categories', all);
    }
    document.querySelector('#newCategory').value = '';
    render();
  });
  render();
}

function initReports() {
  const target = document.querySelector('#categoryReport');
  if (!target) return;
  const render = () => {
    const expenses = transactions().filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0) || 1;
    const groups = {};
    expenses.forEach(t => groups[t.category] = (groups[t.category] || 0) + Number(t.amount));
    target.innerHTML = Object.entries(groups).sort((a,b) => b[1]-a[1]).map(([name, amount]) => {
      const pct = Math.round((amount / total) * 100);
      return `<div class="report-row"><strong>${name}</strong><div class="bar"><span style="width:${pct}%"></span></div><span>${money(amount)}</span><span>${pct}%</span></div>`;
    }).join('');
    const income = transactions().filter(t => t.type === 'income').reduce((s,t)=>s+Number(t.amount),0);
    const expenseTotal = transactions().filter(t => t.type === 'expense').reduce((s,t)=>s+Number(t.amount),0);
    document.querySelector('#reportIncome').textContent = money(income);
    document.querySelector('#reportExpenses').textContent = money(expenseTotal);
    document.querySelector('#reportBalance').textContent = money(income - expenseTotal);
  };
  document.querySelector('#generateReport').addEventListener('click', render);
  render();
}

function initSettings() {
  const form = document.querySelector('#settingsForm');
  if (!form) return;
  const user = JSON.parse(localStorage.getItem('bb_user') || '{"fullName":"BudgetBridge User","email":"user@example.com"}');
  document.querySelector('#settingsName').value = user.fullName || '';
  document.querySelector('#settingsEmail').value = user.email || '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    localStorage.setItem('bb_user', JSON.stringify({
      fullName: document.querySelector('#settingsName').value.trim(),
      email: document.querySelector('#settingsEmail').value.trim()
    }));
    document.querySelector('#settingsMessage').textContent = 'Account settings saved.';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  dashboard();
  populateCategoryOptions();
  initTransactionsPage();
  initTransactionForm();
  initCategories();
  initReports();
  initSettings();
});
