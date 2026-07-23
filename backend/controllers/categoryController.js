const validation = require('../utils/validation');

exports.list = async context => {
  const categories = await context.store.listCategories(context.user.userId);
  context.sendJson(200, { success: true, categories });
};

exports.create = async context => {
  const input = validation.category(context.body);
  const category = await context.store.createCategory(context.user.userId, input);
  await context.store.logActivity(context.user.userId, 'CREATE_CATEGORY', `Created category ${category.name}.`);
  context.sendJson(201, { success: true, category, message: 'Category created.' });
};

exports.update = async context => {
  const categoryId = validation.id(context.params.id, 'Category');
  const input = validation.category(context.body);
  const category = await context.store.updateCategory(context.user.userId, categoryId, input);
  await context.store.logActivity(context.user.userId, 'UPDATE_CATEGORY', `Updated category ${categoryId}.`);
  context.sendJson(200, { success: true, category, message: 'Category updated.' });
};

exports.remove = async context => {
  const categoryId = validation.id(context.params.id, 'Category');
  await context.store.deleteCategory(context.user.userId, categoryId);
  await context.store.logActivity(context.user.userId, 'DELETE_CATEGORY', `Deleted category ${categoryId}.`);
  context.sendJson(200, { success: true, message: 'Category deleted.' });
};
