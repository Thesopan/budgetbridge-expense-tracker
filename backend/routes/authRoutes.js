const controller = require('../controllers/authController');
module.exports = (req, res, sendJson) => {
  if (req.method === 'POST' && req.url.startsWith('/api/auth/login')) return controller.login(req, res, sendJson);
  if (req.method === 'POST' && req.url.startsWith('/api/auth/register')) return controller.register(req, res, sendJson);
  return sendJson(res, 404, { error: 'Auth route not found' });
};
