const controller = require('../controllers/categoryController');
module.exports = (req, res, sendJson) => {
  if (req.method === 'GET') return controller.list(req, res, sendJson);
  if (req.method === 'POST') return controller.create(req, res, sendJson);
  return sendJson(res, 405, { error: 'Method not allowed' });
};
