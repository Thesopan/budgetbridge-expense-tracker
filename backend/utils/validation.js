const { AppError } = require('./errors');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function text(value, field, maxLength, required = true) {
  const cleaned = typeof value === 'string' ? value.trim() : '';
  if (required && !cleaned) throw new AppError(400, `${field} is required.`, 'VALIDATION_ERROR');
  if (cleaned.length > maxLength) throw new AppError(400, `${field} must be ${maxLength} characters or fewer.`, 'VALIDATION_ERROR');
  return cleaned;
}

function email(value) {
  const cleaned = text(value, 'Email', 150).toLowerCase();
  if (!EMAIL_PATTERN.test(cleaned)) throw new AppError(400, 'Enter a valid email address.', 'VALIDATION_ERROR');
  return cleaned;
}

function password(value, field = 'Password') {
  if (typeof value !== 'string') throw new AppError(400, `${field} is required.`, 'VALIDATION_ERROR');
  if (value.length < 8 || value.length > 128) {
    throw new AppError(400, `${field} must be between 8 and 128 characters.`, 'VALIDATION_ERROR');
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    throw new AppError(400, `${field} must include an uppercase letter, lowercase letter, and number.`, 'VALIDATION_ERROR');
  }
  return value;
}

function positiveMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999.99) {
    throw new AppError(400, 'Amount must be a positive number no greater than 99,999,999.99.', 'VALIDATION_ERROR');
  }
  return Math.round(amount * 100) / 100;
}

function id(value, field = 'ID') {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new AppError(400, `${field} is invalid.`, 'VALIDATION_ERROR');
  return parsed;
}

function date(value, field = 'Date', required = true) {
  if (!value && !required) return null;
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new AppError(400, `${field} must use YYYY-MM-DD format.`, 'VALIDATION_ERROR');
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new AppError(400, `${field} is not a valid calendar date.`, 'VALIDATION_ERROR');
  }
  return value;
}

function categoryType(value) {
  if (!['income', 'expense'].includes(value)) {
    throw new AppError(400, 'Category type must be income or expense.', 'VALIDATION_ERROR');
  }
  return value;
}

function registration(body) {
  return {
    fullName: text(body.fullName, 'Full name', 100),
    email: email(body.email),
    password: password(body.password)
  };
}

function login(body) {
  return { email: email(body.email), password: text(body.password, 'Password', 128) };
}

function category(body) {
  return {
    name: text(body.name, 'Category name', 80),
    type: categoryType(body.type)
  };
}

function transaction(body) {
  return {
    categoryId: id(body.categoryId, 'Category'),
    amount: positiveMoney(body.amount),
    transactionDate: date(body.transactionDate, 'Transaction date'),
    description: text(body.description || '', 'Description', 255, false)
  };
}

function profile(body) {
  return {
    fullName: text(body.fullName, 'Full name', 100),
    email: email(body.email)
  };
}

function passwordChange(body) {
  return {
    currentPassword: text(body.currentPassword, 'Current password', 128),
    newPassword: password(body.newPassword, 'New password')
  };
}

function filters(query) {
  const type = query.type && query.type !== 'all' ? categoryType(query.type) : null;
  const categoryId = query.categoryId && query.categoryId !== 'all' ? id(query.categoryId, 'Category') : null;
  const startDate = date(query.startDate, 'Start date', false);
  const endDate = date(query.endDate, 'End date', false);
  if (startDate && endDate && startDate > endDate) {
    throw new AppError(400, 'Start date cannot be after end date.', 'VALIDATION_ERROR');
  }
  return {
    type,
    categoryId,
    startDate,
    endDate,
    search: text(query.search || '', 'Search', 100, false),
    limit: query.limit ? Math.min(100, id(query.limit, 'Limit')) : null
  };
}

module.exports = {
  registration,
  login,
  category,
  transaction,
  profile,
  passwordChange,
  filters,
  id,
  date,
  password,
  email
};
