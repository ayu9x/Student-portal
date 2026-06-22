const express = require('express');
const { pool } = require('../config/db');
const client = require('prom-client');

const router = express.Router();

// ==========================================
// Prometheus Metrics Setup
// ==========================================
const register = new client.Registry();

// Default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// ==========================================
// Middleware to record metrics
// ==========================================
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    activeConnections.dec();
  });

  next();
}

// ==========================================
// Health Check Endpoint
// ==========================================

/**
 * GET /api/health
 * Returns service health status with DB connectivity
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await pool.execute('SELECT 1');

    res.json({
      status: 'healthy',
      service: 'talenttrack-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'talenttrack-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: err.message,
    });
  }
});

/**
 * GET /api/metrics
 * Returns Prometheus-format metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

module.exports = { router, metricsMiddleware };
