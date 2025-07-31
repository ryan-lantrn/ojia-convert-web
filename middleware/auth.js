const jwt = require('jsonwebtoken');

function getAuthUser(req) {
  try {
    const token = req.cookies['auth-token'];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    );

    return decoded;
  } catch (error) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.user = user;
  next();
}

module.exports = { getAuthUser, requireAuth };