const sampleCategories = [
  { id: 1, name: 'Income', type: 'income' },
  { id: 2, name: 'Food', type: 'expense' },
  { id: 3, name: 'Rent', type: 'expense' }
];

exports.list = (req, res, sendJson) => sendJson(res, 200, { success: true, categories: sampleCategories });
exports.create = (req, res, sendJson) => {
  const { name, type } = req.body;
  if (!name || !['income', 'expense'].includes(type)) {
    return sendJson(res, 400, { success: false, message: 'Category name and valid type are required.' });
  }
  return sendJson(res, 201, { success: true, message: 'Create category endpoint stub successful.', category: { id: 4, name, type } });
};
