'use strict';
const path = require('path');
const express = require('express');
const { errorHandler, notFound } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api/health', require('./routes/health'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api', require('./routes/catalog'));
  app.use('/api/cart', require('./routes/cart'));
  app.use('/api/checkout', require('./routes/checkout'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/profile', require('./routes/profile'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/loyalty', require('./routes/loyalty'));

  if (process.env.ENABLE_TEST_HOOKS === '1') {
    // Test-only hook used by Playwright to start each test from seed data. Never enabled outside test runs.
    app.post('/api/__test__/reset', (req, res) => {
      require('./data/store').reset();
      require('./services/payments/paymentGatewayClient').resetGateway();
      res.status(204).end();
    });
  }

  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
