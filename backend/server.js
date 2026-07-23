const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const config = require('./config');
const { createStore } = require('./data');
const { AppError, mapDatabaseError } = require('./utils/errors');
const {
  parseCookies,
  hashSessionToken,
  applySecurityHeaders,
  isSameOrigin,
  clearSessionCookie
} = require('./utils/security');

const routeHandlers = [
  require('./routes/authRoutes'),
  require('./routes/transactionRoutes'),
  require('./routes/categoryRoutes'),
  require('./routes/reportRoutes'),
  require('./routes/userRoutes')
];

const publicDir = path.resolve(__dirname, '..', 'public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const loginAttempts = new Map();
function checkAuthRateLimit(req) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  if (entry.count > 30) throw new AppError(429, 'Too many authentication attempts. Try again later.', 'RATE_LIMITED');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return resolve({});
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 32768) {
        reject(new AppError(413, 'Request body is too large.', 'BODY_TOO_LARGE'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); }
      catch { reject(new AppError(400, 'Request body must be valid JSON.', 'INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}

function createServer(options = {}) {
  const store = options.store || createStore();
  const appConfig = options.config || config;

  return http.createServer(async (req, res) => {
    applySecurityHeaders(res);
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(requestUrl.pathname);

    const sendJson = (status, payload) => {
      if (res.writableEnded) return;
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(payload));
    };

    try {
      if (pathname.startsWith('/api/')) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !isSameOrigin(req)) {
          throw new AppError(403, 'Cross-origin requests are not allowed.', 'ORIGIN_REJECTED');
        }
        if (pathname === '/api/auth/login' || pathname === '/api/auth/register') checkAuthRateLimit(req);

        const body = await readJsonBody(req);
        const cookies = parseCookies(req.headers.cookie || '');
        const rawToken = cookies.bb_session || null;
        const sessionTokenHash = rawToken ? hashSessionToken(rawToken) : null;
        const user = sessionTokenHash ? await store.findUserBySessionHash(sessionTokenHash) : null;

        const context = {
          req,
          res,
          store,
          config: appConfig,
          method: req.method,
          pathname,
          query: Object.fromEntries(requestUrl.searchParams.entries()),
          params: {},
          body,
          user,
          sessionTokenHash,
          sendJson,
          clearSessionCookie: () => clearSessionCookie(appConfig.nodeEnv === 'production'),
          requireUser() {
            if (!this.user) throw new AppError(401, 'Login is required.', 'AUTH_REQUIRED');
          }
        };

        for (const handler of routeHandlers) {
          const handled = await handler(context);
          if (handled !== false || res.writableEnded) return;
        }
        throw new AppError(404, 'API route not found.', 'NOT_FOUND');
      }

      let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      if (relativePath.endsWith('/')) relativePath += 'index.html';
      const filePath = path.resolve(publicDir, relativePath);
      if (!filePath.startsWith(`${publicDir}${path.sep}`) && filePath !== publicDir) {
        throw new AppError(403, 'Access denied.', 'PATH_REJECTED');
      }

      const stat = await fs.promises.stat(filePath).catch(() => null);
      if (!stat || !stat.isFile()) throw new AppError(404, 'Page not found.', 'NOT_FOUND');
      const extension = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME_TYPES[extension] || 'application/octet-stream');
      if (extension === '.html') res.setHeader('Cache-Control', 'no-store');
      else res.setHeader('Cache-Control', 'public, max-age=300');
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      const mapped = mapDatabaseError(error);
      const status = mapped.status || 500;
      if (status >= 500) console.error(mapped);
      if (pathname.startsWith('/api/')) {
        sendJson(status, {
          success: false,
          error: mapped.code || 'INTERNAL_ERROR',
          message: status >= 500 ? 'The server could not complete the request.' : mapped.message
        });
      } else {
        res.statusCode = status;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(status === 404 ? '404 - Page not found' : 'Unable to load page.');
      }
    }
  });
}

async function start() {
  const store = createStore();
  await store.ping();
  const server = createServer({ store, config });
  server.listen(config.port, () => {
    console.log(`BudgetBridge server running at http://localhost:${config.port}`);
    console.log(`Database mode: ${config.dbMode}`);
  });
}

if (require.main === module) {
  start().catch(error => {
    console.error('BudgetBridge could not start:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { createServer };
