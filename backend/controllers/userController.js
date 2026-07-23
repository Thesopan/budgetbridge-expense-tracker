const validation = require('../utils/validation');
const { hashPassword, verifyPassword } = require('../utils/security');
const { AppError } = require('../utils/errors');
const { publicUser } = require('./authController');

exports.profile = async context => {
  context.sendJson(200, { success: true, user: publicUser(context.user) });
};

exports.updateProfile = async context => {
  const input = validation.profile(context.body);
  const user = await context.store.updateProfile(context.user.userId, input);
  await context.store.logActivity(context.user.userId, 'UPDATE_PROFILE', 'Updated account profile.');
  context.sendJson(200, { success: true, user: publicUser(user), message: 'Profile updated.' });
};

exports.updatePassword = async context => {
  const input = validation.passwordChange(context.body);
  const currentUser = await context.store.getUserById(context.user.userId);
  if (!currentUser || !(await verifyPassword(input.currentPassword, currentUser.passwordHash))) {
    throw new AppError(401, 'Current password is incorrect.', 'INVALID_PASSWORD');
  }
  if (input.currentPassword === input.newPassword) {
    throw new AppError(400, 'New password must be different from the current password.', 'VALIDATION_ERROR');
  }
  const newHash = await hashPassword(input.newPassword);
  await context.store.updatePassword(context.user.userId, newHash);
  context.res.setHeader('Set-Cookie', context.clearSessionCookie());
  context.sendJson(200, { success: true, message: 'Password updated. Please log in again.' });
};
