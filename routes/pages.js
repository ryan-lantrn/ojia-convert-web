const express = require('express');
const { getAuthUser } = require('../middleware/auth');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Auth pages
router.get('/auth/login', (req, res) => {
  const user = getAuthUser(req);
  if (user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Login', error: null });
});

router.get('/auth/register', (req, res) => {
  const user = getAuthUser(req);
  if (user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { title: 'Register', error: null });
});

// Dashboard pages (require authentication)
router.get('/dashboard', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/index', { title: 'Dashboard', user });
});

router.get('/dashboard/publication', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/publication', { title: 'Publication Profile', user });
});

router.get('/dashboard/upload', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/upload', { title: 'Upload Files', user });
});

router.get('/dashboard/notices', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/notices', { title: 'Manage Notices', user });
});

router.get('/dashboard/calendar', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/calendar', { title: 'Calendar', user });
});

router.get('/dashboard/weekly-sheets', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/weekly-sheets', { title: 'Weekly Sheets', user });
});

router.get('/dashboard/files', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard/files', { title: 'Files', user });
});

module.exports = router;