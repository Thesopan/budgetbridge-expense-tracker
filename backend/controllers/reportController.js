exports.summary = (req, res, sendJson) => {
  return sendJson(res, 200, {
    success: true,
    summary: {
      totalIncome: 1560.00,
      totalExpenses: 1026.50,
      balance: 533.50,
      byCategory: [
        { category: 'Rent', total: 820.00 },
        { category: 'Food', total: 64.25 },
        { category: 'School', total: 92.00 }
      ]
    }
  });
};
