const controller = require('../controllers/authController');

module.exports = async context => {
  const { method, pathname } = context;
  if (method === 'POST' && pathname === '/api/auth/register') return controller.register(context);
  if (method === 'POST' && pathname === '/api/auth/login') return controller.login(context);
  if (method === 'POST' && pathname === '/api/auth/logout') return controller.logout(context);
  if (method === 'GET' && pathname === '/api/auth/session') return controller.session(context);
  return false;
};
