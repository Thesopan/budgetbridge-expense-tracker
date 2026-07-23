const validation = require('../utils/validation');

exports.summary = async context => {
  const filters = validation.filters(context.query);
  const summary = await context.store.getSummary(context.user.userId, filters);
  context.sendJson(200, { success: true, summary });
};
