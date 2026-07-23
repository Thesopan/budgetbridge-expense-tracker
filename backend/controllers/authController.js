const validation = require('../utils/validation');
const {
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashSessionToken,
  sessionCookie,
  clearSessionCookie
} = require('../utils/security');
const { AppError } = require('../utils/errors');

function publicUser(user) {
  return { userId: user.userId, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
}

async function establishSession(context, user) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + context.config.sessionDays * 24 * 60 * 60 * 1000);
  await context.store.createSession(user.userId, hashSessionToken(token), expiresAt);
  context.res.setHeader(
    'Set-Cookie',
    sessionCookie(token, context.config.sessionDays * 24 * 60 * 60, context.config.nodeEnv === 'production')
  );
}

exports.register = async context => {
  const input = validation.registration(context.body);
  const passwordHash = await hashPassword(input.password);
  const user = await context.store.createUserWithDefaults({ ...input, passwordHash });
  await establishSession(context, user);
  await context.store.logActivity(user.userId, 'REGISTER', 'Account registered.');
  context.sendJson(201, { success: true, user: publicUser(user), message: 'Account created successfully.' });
};

exports.login = async context => {
  const input = validation.login(context.body);
  const user = await context.store.findUserByEmail(input.email);
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  }
  await establishSession(context, user);
  await context.store.logActivity(user.userId, 'LOGIN', 'User logged in.');
  context.sendJson(200, { success: true, user: publicUser(user), message: 'Login successful.' });
};

exports.logout = async context => {
  if (context.sessionTokenHash) await context.store.deleteSession(context.sessionTokenHash);
  context.res.setHeader('Set-Cookie', clearSessionCookie(context.config.nodeEnv === 'production'));
  context.sendJson(200, { success: true, message: 'Logged out.' });
};

exports.session = async context => {
  if (!context.user) return context.sendJson(200, { success: true, authenticated: false });
  context.sendJson(200, { success: true, authenticated: true, user: publicUser(context.user) });
};

exports.publicUser = publicUser;
