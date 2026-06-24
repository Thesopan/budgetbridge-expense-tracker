const sampleTransactions = [
  { id: 1, type: 'income', category: 'Income', amount: 1250.00, transactionDate: '2026-06-12', description: 'Paycheque' },
  { id: 2, type: 'expense', category: 'Rent', amount: 820.00, transactionDate: '2026-06-10', description: 'Rent payment' }
];

exports.list = (req, res, sendJson) => sendJson(res, 200, { success: true, transactions: sampleTransactions });

exports.create = (req, res, sendJson) => {
  const { type, categoryId, amount, transactionDate, description } = req.body;
  if (!['income', 'expense'].includes(type) || Number(amount) <= 0 || !transactionDate) {
    return sendJson(res, 400, { success: false, message: 'Type, positive amount, and date are required.' });
  }
  return sendJson(res, 201, { success: true, message: 'Create transaction endpoint stub successful.', transaction: { id: 3, type, categoryId, amount, transactionDate, description } });
};

exports.update = (req, res, sendJson) => sendJson(res, 200, { success: true, message: 'Update transaction endpoint stub successful.', id: req.query.id || null });
exports.remove = (req, res, sendJson) => sendJson(res, 200, { success: true, message: 'Delete transaction endpoint stub successful.', id: req.query.id || null });
