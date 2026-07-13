require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const { pool } = require('./db');
const { loadUser } = require('./auth');
const { i18nMiddleware } = require('./i18n');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(
  session({
    store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production' }
  })
);

app.use(loadUser);
app.use(i18nMiddleware);

// Block LINE in-app browser
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (/Line\//i.test(ua) && req.path !== '/line-redirect') {
    const target = `https://${req.hostname}${req.originalUrl}`;
    return res.render('line_redirect', { targetUrl: target });
  }
  next();
});

app.post('/lang', (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'th';
  req.session.lang = lang;
  const back = req.get('Referer') || '/';
  res.redirect(back);
});

app.use(require('./routes/auth'));
app.use(require('./routes/bookings'));
app.use(require('./routes/admin'));

app.use((req, res) => {
  const msg = res.locals.lang === 'en' ? 'Page not found.' : 'ไม่พบหน้านี้';
  res.status(404).render('error', { message: msg });
});

app.use((err, req, res, next) => {
  console.error(err);
  const msg = res.locals.lang === 'en' ? 'An internal error occurred.' : 'เกิดข้อผิดพลาดในระบบ';
  res.status(500).render('error', { message: msg });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Booking app listening on port ${PORT}`));
