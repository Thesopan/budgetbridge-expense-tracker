const { AppError, mapDatabaseError } = require('../utils/errors');
const { DEFAULT_CATEGORIES } = require('./memoryStore');

class MySQLStore {
  constructor(config) {
    let mysql;
    try {
      mysql = require('mysql2/promise');
    } catch {
      throw new Error('The mysql2 package is not installed. Run "npm install" before starting the app.');
    }
    this.pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      dateStrings: true
    });
  }

  async ping() {
    const connection = await this.pool.getConnection();
    try { await connection.ping(); return true; }
    finally { connection.release(); }
  }

  async findUserByEmail(email) {
    const [rows] = await this.pool.execute(
      'SELECT user_id AS userId, full_name AS fullName, email, password_hash AS passwordHash, created_at AS createdAt FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  async getUserById(userId) {
    const [rows] = await this.pool.execute(
      'SELECT user_id AS userId, full_name AS fullName, email, password_hash AS passwordHash, created_at AS createdAt FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  async createUserWithDefaults({ fullName, email, passwordHash }) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
        [fullName, email, passwordHash]
      );
      for (const [name, type] of DEFAULT_CATEGORIES) {
        await connection.execute(
          'INSERT INTO categories (user_id, category_name, category_type, is_default) VALUES (?, ?, ?, TRUE)',
          [result.insertId, name, type]
        );
      }
      await connection.commit();
      return this.getUserById(result.insertId);
    } catch (error) {
      await connection.rollback();
      const mapped = mapDatabaseError(error);
      if (mapped.code === 'DUPLICATE_VALUE') throw new AppError(409, 'An account with that email already exists.', 'EMAIL_EXISTS');
      throw mapped;
    } finally {
      connection.release();
    }
  }

  async createSession(userId, tokenHash, expiresAt) {
    await this.pool.execute('DELETE FROM user_sessions WHERE user_id = ? OR expires_at <= NOW()', [userId]);
    await this.pool.execute(
      'INSERT INTO user_sessions (user_id, session_token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, tokenHash, expiresAt]
    );
  }

  async findUserBySessionHash(tokenHash) {
    const [rows] = await this.pool.execute(
      `SELECT u.user_id AS userId, u.full_name AS fullName, u.email, u.password_hash AS passwordHash, u.created_at AS createdAt
       FROM user_sessions s
       JOIN users u ON u.user_id = s.user_id
       WHERE s.session_token_hash = ? AND s.expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async deleteSession(tokenHash) {
    await this.pool.execute('DELETE FROM user_sessions WHERE session_token_hash = ?', [tokenHash]);
  }

  async updateProfile(userId, { fullName, email }) {
    try {
      await this.pool.execute('UPDATE users SET full_name = ?, email = ? WHERE user_id = ?', [fullName, email, userId]);
      return this.getUserById(userId);
    } catch (error) {
      const mapped = mapDatabaseError(error);
      if (mapped.code === 'DUPLICATE_VALUE') throw new AppError(409, 'That email address is already in use.', 'EMAIL_EXISTS');
      throw mapped;
    }
  }

  async updatePassword(userId, passwordHash) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, userId]);
      await connection.execute('DELETE FROM user_sessions WHERE user_id = ?', [userId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listCategories(userId) {
    const [rows] = await this.pool.execute(
      `SELECT category_id AS categoryId, category_name AS name, category_type AS type, is_default AS isDefault
       FROM categories WHERE user_id = ? ORDER BY category_type, category_name`,
      [userId]
    );
    return rows.map(row => ({ ...row, isDefault: Boolean(row.isDefault) }));
  }

  async getCategory(userId, categoryId) {
    const [rows] = await this.pool.execute(
      `SELECT category_id AS categoryId, category_name AS name, category_type AS type, is_default AS isDefault
       FROM categories WHERE user_id = ? AND category_id = ?`,
      [userId, categoryId]
    );
    return rows[0] ? { ...rows[0], isDefault: Boolean(rows[0].isDefault) } : null;
  }

  async createCategory(userId, { name, type }) {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO categories (user_id, category_name, category_type, is_default) VALUES (?, ?, ?, FALSE)',
        [userId, name, type]
      );
      return this.getCategory(userId, result.insertId);
    } catch (error) {
      const mapped = mapDatabaseError(error);
      if (mapped.code === 'DUPLICATE_VALUE') throw new AppError(409, 'A category with that name already exists.', 'CATEGORY_EXISTS');
      throw mapped;
    }
  }

  async updateCategory(userId, categoryId, { name, type }) {
    const category = await this.getCategory(userId, categoryId);
    if (!category) throw new AppError(404, 'Category not found.', 'NOT_FOUND');
    if (category.isDefault) throw new AppError(403, 'Default categories cannot be edited.', 'DEFAULT_CATEGORY');
    const [[usage]] = await this.pool.execute('SELECT COUNT(*) AS count FROM transactions WHERE user_id = ? AND category_id = ?', [userId, categoryId]);
    if (usage.count > 0 && type !== category.type) throw new AppError(409, 'The type of a category in use cannot be changed.', 'CATEGORY_IN_USE');
    try {
      await this.pool.execute(
        'UPDATE categories SET category_name = ?, category_type = ? WHERE user_id = ? AND category_id = ?',
        [name, type, userId, categoryId]
      );
      return this.getCategory(userId, categoryId);
    } catch (error) {
      const mapped = mapDatabaseError(error);
      if (mapped.code === 'DUPLICATE_VALUE') throw new AppError(409, 'A category with that name already exists.', 'CATEGORY_EXISTS');
      throw mapped;
    }
  }

  async deleteCategory(userId, categoryId) {
    const category = await this.getCategory(userId, categoryId);
    if (!category) throw new AppError(404, 'Category not found.', 'NOT_FOUND');
    if (category.isDefault) throw new AppError(403, 'Default categories cannot be deleted.', 'DEFAULT_CATEGORY');
    const [[usage]] = await this.pool.execute('SELECT COUNT(*) AS count FROM transactions WHERE user_id = ? AND category_id = ?', [userId, categoryId]);
    if (usage.count > 0) throw new AppError(409, 'This category is used by a transaction and cannot be deleted.', 'CATEGORY_IN_USE');
    await this.pool.execute('DELETE FROM categories WHERE user_id = ? AND category_id = ?', [userId, categoryId]);
  }

  _transactionSelect() {
    return `SELECT t.transaction_id AS transactionId, t.category_id AS categoryId,
      c.category_name AS categoryName, c.category_type AS type, t.amount,
      t.transaction_date AS transactionDate, t.description, t.created_at AS createdAt
      FROM transactions t JOIN categories c ON c.category_id = t.category_id`;
  }

  async listTransactions(userId, filters = {}) {
    const conditions = ['t.user_id = ?'];
    const params = [userId];
    if (filters.type) { conditions.push('c.category_type = ?'); params.push(filters.type); }
    if (filters.categoryId) { conditions.push('t.category_id = ?'); params.push(filters.categoryId); }
    if (filters.startDate) { conditions.push('t.transaction_date >= ?'); params.push(filters.startDate); }
    if (filters.endDate) { conditions.push('t.transaction_date <= ?'); params.push(filters.endDate); }
    if (filters.search) {
      conditions.push('(t.description LIKE ? OR c.category_name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    let sql = `${this._transactionSelect()} WHERE ${conditions.join(' AND ')} ORDER BY t.transaction_date DESC, t.transaction_id DESC`;
    if (filters.limit) {
      const limit = Number.parseInt(filters.limit, 10);
      if (Number.isInteger(limit) && limit > 0 && limit <= 100) {
        sql += ` LIMIT ${limit}`;
      }
    }
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async getTransaction(userId, transactionId) {
    const [rows] = await this.pool.execute(
      `${this._transactionSelect()} WHERE t.user_id = ? AND t.transaction_id = ?`,
      [userId, transactionId]
    );
    return rows[0] || null;
  }

  async _assertCategory(userId, categoryId) {
    const category = await this.getCategory(userId, categoryId);
    if (!category) throw new AppError(400, 'The selected category does not exist.', 'INVALID_CATEGORY');
  }

  async createTransaction(userId, data) {
    await this._assertCategory(userId, data.categoryId);
    const [result] = await this.pool.execute(
      `INSERT INTO transactions (user_id, category_id, amount, transaction_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.categoryId, data.amount, data.transactionDate, data.description || null]
    );
    return this.getTransaction(userId, result.insertId);
  }

  async updateTransaction(userId, transactionId, data) {
    await this._assertCategory(userId, data.categoryId);
    const [result] = await this.pool.execute(
      `UPDATE transactions SET category_id = ?, amount = ?, transaction_date = ?, description = ?
       WHERE user_id = ? AND transaction_id = ?`,
      [data.categoryId, data.amount, data.transactionDate, data.description || null, userId, transactionId]
    );
    if (result.affectedRows === 0) throw new AppError(404, 'Transaction not found.', 'NOT_FOUND');
    return this.getTransaction(userId, transactionId);
  }

  async deleteTransaction(userId, transactionId) {
    const [result] = await this.pool.execute('DELETE FROM transactions WHERE user_id = ? AND transaction_id = ?', [userId, transactionId]);
    if (result.affectedRows === 0) throw new AppError(404, 'Transaction not found.', 'NOT_FOUND');
  }

  async getSummary(userId, filters = {}) {
    const conditions = ['t.user_id = ?'];
    const params = [userId];
    if (filters.startDate) { conditions.push('t.transaction_date >= ?'); params.push(filters.startDate); }
    if (filters.endDate) { conditions.push('t.transaction_date <= ?'); params.push(filters.endDate); }
    const where = conditions.join(' AND ');

    const [[totals]] = await this.pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN c.category_type = 'income' THEN t.amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN c.category_type = 'expense' THEN t.amount ELSE 0 END), 0) AS totalExpenses
       FROM transactions t JOIN categories c ON c.category_id = t.category_id WHERE ${where}`,
      params
    );

    const [byCategory] = await this.pool.execute(
      `SELECT c.category_name AS categoryName, SUM(t.amount) AS total
       FROM transactions t JOIN categories c ON c.category_id = t.category_id
       WHERE ${where} AND c.category_type = 'expense'
       GROUP BY c.category_id, c.category_name ORDER BY total DESC`,
      params
    );

    const recentTransactions = await this.listTransactions(userId, { ...filters, limit: 5 });
    return {
      totalIncome: Number(totals.totalIncome),
      totalExpenses: Number(totals.totalExpenses),
      balance: Number(totals.totalIncome) - Number(totals.totalExpenses),
      byCategory,
      recentTransactions
    };
  }

  async logActivity(userId, actionType, description) {
    await this.pool.execute(
      'INSERT INTO activity_logs (user_id, action_type, action_description) VALUES (?, ?, ?)',
      [userId, actionType, description]
    );
  }
}

module.exports = { MySQLStore };
