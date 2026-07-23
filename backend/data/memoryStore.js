const { AppError } = require('../utils/errors');

const DEFAULT_CATEGORIES = [
  ['Employment Income', 'income'],
  ['Other Income', 'income'],
  ['Food', 'expense'],
  ['Rent', 'expense'],
  ['Transportation', 'expense'],
  ['School', 'expense'],
  ['Entertainment', 'expense'],
  ['Utilities', 'expense'],
  ['Other Expense', 'expense']
];

class MemoryStore {
  constructor() {
    this.users = [];
    this.categories = [];
    this.transactions = [];
    this.sessions = [];
    this.activityLogs = [];
    this.ids = { user: 1, category: 1, transaction: 1, log: 1 };
  }

  async ping() { return true; }

  async findUserByEmail(email) {
    return this.users.find(user => user.email === email) || null;
  }

  async getUserById(userId) {
    return this.users.find(user => user.userId === userId) || null;
  }

  async createUserWithDefaults({ fullName, email, passwordHash }) {
    if (await this.findUserByEmail(email)) throw new AppError(409, 'An account with that email already exists.', 'EMAIL_EXISTS');
    const user = { userId: this.ids.user++, fullName, email, passwordHash, createdAt: new Date().toISOString() };
    this.users.push(user);
    for (const [name, type] of DEFAULT_CATEGORIES) {
      this.categories.push({ categoryId: this.ids.category++, userId: user.userId, name, type, isDefault: true });
    }
    return { ...user };
  }

  async createSession(userId, tokenHash, expiresAt) {
    this.sessions = this.sessions.filter(session => session.userId !== userId && session.expiresAt > new Date());
    this.sessions.push({ userId, tokenHash, expiresAt });
  }

  async findUserBySessionHash(tokenHash) {
    const now = new Date();
    const session = this.sessions.find(item => item.tokenHash === tokenHash && item.expiresAt > now);
    return session ? this.getUserById(session.userId) : null;
  }

  async deleteSession(tokenHash) {
    this.sessions = this.sessions.filter(item => item.tokenHash !== tokenHash);
  }

  async updateProfile(userId, { fullName, email }) {
    const duplicate = this.users.find(user => user.email === email && user.userId !== userId);
    if (duplicate) throw new AppError(409, 'That email address is already in use.', 'EMAIL_EXISTS');
    const user = await this.getUserById(userId);
    if (!user) throw new AppError(404, 'User not found.', 'NOT_FOUND');
    user.fullName = fullName;
    user.email = email;
    return { ...user };
  }

  async updatePassword(userId, passwordHash) {
    const user = await this.getUserById(userId);
    if (!user) throw new AppError(404, 'User not found.', 'NOT_FOUND');
    user.passwordHash = passwordHash;
    this.sessions = this.sessions.filter(session => session.userId !== userId);
  }

  async listCategories(userId) {
    return this.categories
      .filter(category => category.userId === userId)
      .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
      .map(category => ({ ...category }));
  }

  async getCategory(userId, categoryId) {
    return this.categories.find(category => category.userId === userId && category.categoryId === categoryId) || null;
  }

  async createCategory(userId, { name, type }) {
    if (this.categories.some(category => category.userId === userId && category.name.toLowerCase() === name.toLowerCase())) {
      throw new AppError(409, 'A category with that name already exists.', 'CATEGORY_EXISTS');
    }
    const category = { categoryId: this.ids.category++, userId, name, type, isDefault: false };
    this.categories.push(category);
    return { ...category };
  }

  async updateCategory(userId, categoryId, { name, type }) {
    const category = await this.getCategory(userId, categoryId);
    if (!category) throw new AppError(404, 'Category not found.', 'NOT_FOUND');
    if (category.isDefault) throw new AppError(403, 'Default categories cannot be edited.', 'DEFAULT_CATEGORY');
    if (this.categories.some(item => item.userId === userId && item.categoryId !== categoryId && item.name.toLowerCase() === name.toLowerCase())) {
      throw new AppError(409, 'A category with that name already exists.', 'CATEGORY_EXISTS');
    }
    const inUse = this.transactions.some(transaction => transaction.userId === userId && transaction.categoryId === categoryId);
    if (inUse && type !== category.type) throw new AppError(409, 'The type of a category in use cannot be changed.', 'CATEGORY_IN_USE');
    category.name = name;
    category.type = type;
    return { ...category };
  }

  async deleteCategory(userId, categoryId) {
    const category = await this.getCategory(userId, categoryId);
    if (!category) throw new AppError(404, 'Category not found.', 'NOT_FOUND');
    if (category.isDefault) throw new AppError(403, 'Default categories cannot be deleted.', 'DEFAULT_CATEGORY');
    if (this.transactions.some(transaction => transaction.userId === userId && transaction.categoryId === categoryId)) {
      throw new AppError(409, 'This category is used by a transaction and cannot be deleted.', 'CATEGORY_IN_USE');
    }
    this.categories = this.categories.filter(item => item.categoryId !== categoryId);
  }

  _transactionView(transaction) {
    const category = this.categories.find(item => item.categoryId === transaction.categoryId);
    return {
      transactionId: transaction.transactionId,
      categoryId: transaction.categoryId,
      categoryName: category ? category.name : 'Unknown',
      type: category ? category.type : 'expense',
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      description: transaction.description,
      createdAt: transaction.createdAt
    };
  }

  async listTransactions(userId, filters = {}) {
    let result = this.transactions.filter(transaction => transaction.userId === userId).map(item => this._transactionView(item));
    if (filters.type) result = result.filter(item => item.type === filters.type);
    if (filters.categoryId) result = result.filter(item => item.categoryId === filters.categoryId);
    if (filters.startDate) result = result.filter(item => item.transactionDate >= filters.startDate);
    if (filters.endDate) result = result.filter(item => item.transactionDate <= filters.endDate);
    if (filters.search) {
      const needle = filters.search.toLowerCase();
      result = result.filter(item => item.description.toLowerCase().includes(needle) || item.categoryName.toLowerCase().includes(needle));
    }
    result.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.transactionId - a.transactionId);
    return filters.limit ? result.slice(0, filters.limit) : result;
  }

  async getTransaction(userId, transactionId) {
    const transaction = this.transactions.find(item => item.userId === userId && item.transactionId === transactionId);
    return transaction ? this._transactionView(transaction) : null;
  }

  async createTransaction(userId, data) {
    const category = await this.getCategory(userId, data.categoryId);
    if (!category) throw new AppError(400, 'The selected category does not exist.', 'INVALID_CATEGORY');
    const transaction = {
      transactionId: this.ids.transaction++,
      userId,
      categoryId: data.categoryId,
      amount: data.amount,
      transactionDate: data.transactionDate,
      description: data.description,
      createdAt: new Date().toISOString()
    };
    this.transactions.push(transaction);
    return this._transactionView(transaction);
  }

  async updateTransaction(userId, transactionId, data) {
    const transaction = this.transactions.find(item => item.userId === userId && item.transactionId === transactionId);
    if (!transaction) throw new AppError(404, 'Transaction not found.', 'NOT_FOUND');
    const category = await this.getCategory(userId, data.categoryId);
    if (!category) throw new AppError(400, 'The selected category does not exist.', 'INVALID_CATEGORY');
    Object.assign(transaction, data);
    return this._transactionView(transaction);
  }

  async deleteTransaction(userId, transactionId) {
    const before = this.transactions.length;
    this.transactions = this.transactions.filter(item => !(item.userId === userId && item.transactionId === transactionId));
    if (this.transactions.length === before) throw new AppError(404, 'Transaction not found.', 'NOT_FOUND');
  }

  async getSummary(userId, filters = {}) {
    const transactions = await this.listTransactions(userId, filters);
    let totalIncome = 0;
    let totalExpenses = 0;
    const grouped = new Map();
    for (const item of transactions) {
      if (item.type === 'income') totalIncome += Number(item.amount);
      else totalExpenses += Number(item.amount);
      if (item.type === 'expense') grouped.set(item.categoryName, (grouped.get(item.categoryName) || 0) + Number(item.amount));
    }
    const byCategory = [...grouped.entries()]
      .map(([categoryName, total]) => ({ categoryName, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);
    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      byCategory,
      recentTransactions: transactions.slice(0, 5)
    };
  }

  async logActivity(userId, actionType, description) {
    this.activityLogs.push({ logId: this.ids.log++, userId, actionType, description, createdAt: new Date().toISOString() });
  }
}

module.exports = { MemoryStore, DEFAULT_CATEGORIES };
