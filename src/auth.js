const { OAuth2Client } = require('google-auth-library');
const db = require('./db');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
  const payload = ticket.getPayload();
  const email = payload.email;
  const domain = (email.split('@')[1] || '').toLowerCase();

  if (ALLOWED_DOMAINS.length && !ALLOWED_DOMAINS.includes(domain)) {
    const err = new Error(`Email domain ${domain} is not allowed`);
    err.code = 'DOMAIN_NOT_ALLOWED';
    throw err;
  }

  return {
    googleId: payload.sub,
    email,
    name: payload.name || email,
    avatarUrl: payload.picture
  };
}

async function upsertUser({ googleId, email, name, avatarUrl }) {
  const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'student';

  const existing = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (existing.rows.length) {
    const updated = await db.query(
      'UPDATE users SET name = $1, avatar_url = $2, role = $3 WHERE google_id = $4 RETURNING *',
      [name, avatarUrl, role, googleId]
    );
    return updated.rows[0];
  }

  const inserted = await db.query(
    'INSERT INTO users (google_id, email, name, avatar_url, role) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [googleId, email, name, avatarUrl, role]
  );
  return inserted.rows[0];
}

async function loadUser(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
      req.user = rows[0] || null;
    } else {
      req.user = null;
    }
    res.locals.currentUser = req.user;
    next();
  } catch (err) {
    next(err);
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.user) return next();
  res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).render('error', { message: 'Admins only' });
}

module.exports = {
  verifyGoogleToken,
  upsertUser,
  loadUser,
  ensureAuthenticated,
  ensureAdmin,
  CLIENT_ID
};
