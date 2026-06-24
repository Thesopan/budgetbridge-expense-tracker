const controller = require('../controllers/transactionController');
module.exports = (req, res, sendJson) => {
  if (req.method === 'GET') return controller.list(req, res, sendJson);
  if (req.method === 'POST') return controller.create(req, res, sendJson);
  if (req.method === 'PUT') return controller.update(req, res, sendJson);
  if (req.method === 'DELETE') return controller.remove(req, res, sendJson);
  return sendJson(res, 405, { error: 'Method not allowed' });
};
