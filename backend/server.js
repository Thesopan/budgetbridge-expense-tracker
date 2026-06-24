const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '..', 'public');

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload, null, 2));
}

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  filePath = path.normalize(filePath).replace(/^\.\.(\/|\\|$)/, '');
  const fullPath = path.join(publicDir, filePath);
  const ext = path.extname(fullPath).toLowerCase();
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'File not found' });
      return;
    }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  req.query = parsed.query;
  req.body = await readBody(req);

  if (parsed.pathname.startsWith('/api/auth')) return authRoutes(req, res, sendJson);
  if (parsed.pathname.startsWith('/api/transactions')) return transactionRoutes(req, res, sendJson);
  if (parsed.pathname.startsWith('/api/categories')) return categoryRoutes(req, res, sendJson);
  if (parsed.pathname.startsWith('/api/reports')) return reportRoutes(req, res, sendJson);

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`BudgetBridge Milestone 02 server running at http://localhost:${PORT}`);
});
