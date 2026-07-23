const controller = require('../controllers/transactionController');

module.exports = async context => {
  const match = context.pathname.match(/^\/api\/transactions(?:\/(\d+))?$/);
  if (!match) return false;
  context.requireUser();
  context.params.id = match[1] || null;
  if (context.method === 'GET' && !context.params.id) return controller.list(context);
  if (context.method === 'GET' && context.params.id) return controller.get(context);
  if (context.method === 'POST' && !context.params.id) return controller.create(context);
  if (context.method === 'PUT' && context.params.id) return controller.update(context);
  if (context.method === 'DELETE' && context.params.id) return controller.remove(context);
  return false;
};
