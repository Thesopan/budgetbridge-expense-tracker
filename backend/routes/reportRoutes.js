const controller = require('../controllers/reportController');

module.exports = async context => {
  if (context.pathname !== '/api/reports/summary') return false;
  context.requireUser();
  if (context.method === 'GET') return controller.summary(context);
  return false;
};
