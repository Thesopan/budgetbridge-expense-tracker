const controller = require('../controllers/reportController');
module.exports = (req, res, sendJson) => {
  if (req.method === 'GET') return controller.summary(req, res, sendJson);
  return sendJson(res, 405, { error: 'Method not allowed' });
};
