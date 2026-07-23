const crypto = require('crypto');
const { promisify } = require('util');
const scryptAsync = promisify(crypto.scrypt);

const SCRYPT_KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedValue) {
  if (typeof storedValue !== 'string') return false;
  const [algorithm, salt, hash] = storedValue.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEY_LENGTH);
  const storedBuffer = Buffer.from(hash, 'hex');
  if (storedBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(storedBuffer, derivedKey);
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseCookies(header = '') {
  const result = {};
  for (const item of header.split(';')) {
    const index = item.indexOf('=');
    if (index === -1) continue;
    const key = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  }
  return result;
}

function sessionCookie(token, maxAgeSeconds, secure = false) {
  const parts = [
    `bb_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function clearSessionCookie(secure = false) {
  const parts = ['bb_session=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
  );
}

function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return parsed.host === req.headers.host;
  } catch {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashSessionToken,
  parseCookies,
  sessionCookie,
  clearSessionCookie,
  applySecurityHeaders,
  isSameOrigin
};
