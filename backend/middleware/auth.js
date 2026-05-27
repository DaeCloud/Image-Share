const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'photoshare_secret_change_in_production';

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    const value = parts.join('=');
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (req.query && req.query.authToken) {
    return req.query.authToken;
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies.token;
}

function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // ignore invalid token and continue as unauthenticated
    }
  }
  next();
}

module.exports = { authenticate, optionalAuth };
