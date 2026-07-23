const controller = require('../controllers/userController');

module.exports = async context => {
  if (!context.pathname.startsWith('/api/user/')) return false;
  context.requireUser();
  if (context.method === 'GET' && context.pathname === '/api/user/profile') return controller.profile(context);
  if (context.method === 'PUT' && context.pathname === '/api/user/profile') return controller.updateProfile(context);
  if (context.method === 'PUT' && context.pathname === '/api/user/password') return controller.updatePassword(context);
  return false;
};
