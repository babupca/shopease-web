'use strict';
const store = require('../../src/data/store');
const gateway = require('../../src/services/payments/paymentGatewayClient');

beforeEach(() => {
  store.reset();
  gateway.resetGateway();
});
