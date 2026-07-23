class AppError extends Error {
  constructor(status, message, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

function mapDatabaseError(error) {
  if (error instanceof AppError) return error;
  if (error && error.code === 'ER_DUP_ENTRY') {
    return new AppError(409, 'That value is already in use.', 'DUPLICATE_VALUE');
  }
  if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError(400, 'The selected related record does not exist.', 'INVALID_REFERENCE');
  }
  if (error && error.code === 'ER_ROW_IS_REFERENCED_2') {
    return new AppError(409, 'This record is still in use and cannot be deleted.', 'RECORD_IN_USE');
  }
  return error;
}

module.exports = { AppError, mapDatabaseError };
