'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const shoppingRoutes = require('./routes/shoppingRoutes');
const { errorHandler, appError } = require('./middleware/errors');

function getAllowedOrigins() {
  const configured = String(process.env.CLIENT_URL || '').trim();
  if (!configured) throw new Error('CLIENT_URL is required; configure one or more exact HTTP(S) browser origins.');
  const origins = new Set();
  for (const candidate of configured.split(',')) {
    const value = candidate.trim();
    if (!value) continue;
    let parsed;
    try { parsed = new URL(value); }
    catch { throw new Error(`CLIENT_URL contains an invalid origin: ${value}`); }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password
      || !['', '/'].includes(parsed.pathname) || parsed.search || parsed.hash) {
      throw new Error(`CLIENT_URL entries must be bare HTTP(S) origins: ${value}`);
    }
    origins.add(parsed.origin);
  }
  if (!origins.size) throw new Error('CLIENT_URL must include at least one HTTP(S) origin.');
  return origins;
}

function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();
  const embeddedPreview = process.env.PREVIEW_EMBED === 'true';
  app.disable('x-powered-by');
  const productionCsp = process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  } : false;
  const helmetOptions = { crossOriginEmbedderPolicy: false, contentSecurityPolicy: productionCsp };
  if (embeddedPreview) helmetOptions.frameguard = false;
  app.use(helmet(helmetOptions));
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, false);
      return callback(null, allowedOrigins.has(origin) ? origin : false);
    },
    credentials: true,
  }));
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const origin = req.get('origin');
      if (origin && !allowedOrigins.has(origin)) return next(appError('Request origin is not allowed.', 403));
      if (req.get('sec-fetch-site') === 'cross-site') return next(appError('Cross-site changes are not allowed.', 403));
    }
    next();
  });
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.get('/api/health', (req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/payments')) return next();
    if (mongoose.connection.readyState !== 1) return next(appError('The product database is not connected. Configure MONGO_URI and start MongoDB.', 503));
    next();
  });
  app.use('/api/auth', authRoutes);
  app.use('/api', catalogRoutes);
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api', shoppingRoutes);
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api', (req, res, next) => next(appError('API route not found.', 404)));

  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(__dirname, '../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next(appError('API route not found.', 404));
      res.sendFile(path.join(clientDist, 'index.html'), error => error && next(error));
    });
  }
  app.use(errorHandler);
  return app;
}
module.exports = { createApp, getAllowedOrigins };
