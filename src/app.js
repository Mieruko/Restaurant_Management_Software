const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Serve front-end static files from the public/ folder at project root
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Simple rate limiter
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Routes
app.get('/', (req, res) => {
  // If the client accepts HTML, serve the front-end index
  if (req.accepts && req.accepts('html')) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  // Otherwise return API status JSON
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// A simple API root used by tests and clients
app.get('/api', (req, res) => {
  res.json({ message: 'Chào mừng đến với API Nhà hàng', status: 'ok' });
});

// Mount API routers using the existing route modules
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const staffRoutes = require('./routes/staffRoutes');
const tableRoutes = require('./routes/tableRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const customerRoutes = require('./routes/customerRoutes');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);

// Serve saved print files (mock printer output)
const printFilesDir = path.join(__dirname, '..', 'tmp_prints');
if (require('fs').existsSync(printFilesDir)) {
  app.use('/print_files', express.static(printFilesDir));
}

// Simple authentication endpoint used by the demo front-end (supports form posts and fetch JSON)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};

  // If configured to use DB, authenticate against NHAN_VIEN.username/password_hash
  if (process.env.USE_DB === 'true') {
    try {
      const bcrypt = require('bcryptjs');
      // try VN staff model first
      let Staff;
      try { Staff = require('./db_models/vn/StaffVnModel'); } catch (e) { Staff = null; }
      if (!Staff) {
        // fallback to any existing staff model in src/models
        try { Staff = require('./models/staff'); } catch (er) { Staff = null; }
      }
      if (Staff) {
        const user = await Staff.findOne({ where: { username } });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        let ok = false;
        try {
          ok = bcrypt.compareSync(password || '', user.password_hash || '');
        } catch (e) {
          ok = false;
        }
        // Fallback: if stored value is not a bcrypt hash but equals the raw password, accept (helps migrate existing data)
        if (!ok && user.password_hash && String(user.password_hash) === String(password)) {
          ok = true;
        }
        if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const token = 'db-token-' + Date.now();
        res.cookie && res.cookie('auth_token', token, { httpOnly: false });
        // mark admin for UI if applicable
        try {
          const isAdmin = (user && (user.username === 'admin' || user.role === 'admin'));
          if (isAdmin) res.cookie && res.cookie('isAdmin', '1', { httpOnly: false });
          else res.cookie && res.cookie('isAdmin', '', { maxAge: 0 });
        } catch (e) { /* ignore */ }
        if (req.accepts && req.accepts('html')) return res.redirect('/dashboard/menu.html');
        return res.json({ success: true, token, username });
      }
    } catch (err) {
      console.error('DB auth error', err);
      return res.status(500).json({ success: false, message: 'Auth error' });
    }
  }

  // Demo-only authentication: accept admin/admin or any non-empty credentials in dev mode
  const ok = (username === 'admin' && password === 'admin') || (process.env.NODE_ENV !== 'production' && username && password);

  if (!ok) {
    if (req.accepts && req.accepts('html')) {
      return res.redirect('/login.html?error=invalid');
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = 'demo-token-' + Date.now();
  res.cookie && res.cookie('auth_token', token, { httpOnly: false });
  // In demo mode, treat username 'admin' as admin UI
  try { if (username === 'admin') res.cookie && res.cookie('isAdmin', '1', { httpOnly: false }); else res.cookie && res.cookie('isAdmin', '', { maxAge: 0 }); } catch (e) { }
  if (req.accepts && req.accepts('html')) {
    return res.redirect('/dashboard/menu.html');
  }
  res.json({ success: true, token, username });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Không tìm thấy endpoint' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Lỗi máy chủ' });
});

module.exports = app;