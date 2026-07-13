const router = require('express').Router();
const { verifyGoogleToken, upsertUser, CLIENT_ID } = require('../auth');

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('login', { clientId: CLIENT_ID, error: req.query.error || null });
});

router.post('/auth/google', async (req, res, next) => {
  try {
    const idToken = req.body.credential;
    if (!idToken) return res.redirect('/login?error=missing_credential');

    const profile = await verifyGoogleToken(idToken);
    const user = await upsertUser(profile);

    req.session.userId = user.id;
    res.redirect('/');
  } catch (err) {
    if (err.code === 'DOMAIN_NOT_ALLOWED') {
      return res.redirect('/login?error=domain_not_allowed');
    }
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
