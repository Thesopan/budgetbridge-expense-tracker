const validation = require('../utils/validation');
const { AppError } = require('../utils/errors');

exports.list = async context => {
  const filters = validation.filters(context.query);
  const transactions = await context.store.listTransactions(context.user.userId, filters);
  context.sendJson(200, { success: true, transactions });
};

exports.get = async context => {
  const transactionId = validation.id(context.params.id, 'Transaction');
  const transaction = await context.store.getTransaction(context.user.userId, transactionId);
  if (!transaction) throw new AppError(404, 'Transaction not found.', 'NOT_FOUND');
  context.sendJson(200, { success: true, transaction });
};

exports.create = async context => {
  const input = validation.transaction(context.body);
  const transaction = await context.store.createTransaction(context.user.userId, input);
  await context.store.logActivity(context.user.userId, 'CREATE_TRANSACTION', `Created transaction ${transaction.transactionId}.`);
  context.sendJson(201, { success: true, transaction, message: 'Transaction created.' });
};

exports.update = async context => {
  const transactionId = validation.id(context.params.id, 'Transaction');
  const input = validation.transaction(context.body);
  const transaction = await context.store.updateTransaction(context.user.userId, transactionId, input);
  await context.store.logActivity(context.user.userId, 'UPDATE_TRANSACTION', `Updated transaction ${transactionId}.`);
  context.sendJson(200, { success: true, transaction, message: 'Transaction updated.' });
};

exports.remove = async context => {
  const transactionId = validation.id(context.params.id, 'Transaction');
  await context.store.deleteTransaction(context.user.userId, transactionId);
  await context.store.logActivity(context.user.userId, 'DELETE_TRANSACTION', `Deleted transaction ${transactionId}.`);
  context.sendJson(200, { success: true, message: 'Transaction deleted.' });
};
