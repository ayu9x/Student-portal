require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { waitForDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const trainingRoutes = require('./routes/training');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
const placementRoutes = require('./routes/placements');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const { router: healthRoutes, metricsMiddleware } = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// Middleware
// ==========================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Prometheus metrics middleware
app.use(metricsMiddleware);

// ==========================================
// Routes
// ==========================================

// Health & metrics (no auth required)
app.use('/api', healthRoutes);

// Authentication
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/students', studentRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// Error Handling
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
});

// ==========================================
// Server Startup
// ==========================================

async function start() {
  try {
    // Wait for database to be ready
    await waitForDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔══════════════════════════════════════════════╗
║   🎓 TalentTrack Portal - Backend API       ║
║   Running on http://0.0.0.0:${PORT}            ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
║   Health: http://0.0.0.0:${PORT}/api/health     ║
║   Metrics: http://0.0.0.0:${PORT}/api/metrics   ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
