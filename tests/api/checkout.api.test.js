'use strict';
const { request, newApp, loginAs, addToCart, placeOrder } = require('../helpers/api');
const store = require('../../src/data/store');

describe('Checkout API', () => {
  let app;
  let token;
  beforeEach(async () => {
    app = newApp();
    token = await loginAs(app);
  });

  test('[API-CHK-001] POST /checkout/quote prices the cart', async () => {
    await addToCart(app, token, 'P-1003', 1);
    const res = await request(app).post('/api/checkout/quote').set('Authorization', `Bearer ${token}`).send({});
    expect(res.body).toMatchObject({ subtotal: 14.99, shipping: 5.99, tax: 1.09, total: 22.07 });
  });

  test('[API-CHK-002] quoting an empty cart returns 400', async () => {
    expect((await request(app).post('/api/checkout/quote').set('Authorization', `Bearer ${token}`).send({})).status).toBe(400);
  });

  test('[API-CHK-003] POST /checkout places a PAID order (201)', async () => {
    await addToCart(app, token, 'P-1001', 1);
    const res = await placeOrder(app, token);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PAID');
  });

  test('[API-CHK-004] the order response matches the Order contract', async () => {
    await addToCart(app, token, 'P-1001', 1);
    const res = await placeOrder(app, token);
    expect(Object.keys(res.body).sort()).toEqual(
      ['createdAt', 'discount', 'id', 'items', 'promoCode', 'shipping', 'status', 'subtotal', 'tax', 'totalAmount'].sort()
    );
  });

  test('[API-CHK-005] a declined card returns 402 with the failed order id', async () => {
    await addToCart(app, token, 'P-1001', 1);
    const res = await placeOrder(app, token, { cardToken: 'tok_decline' });
    expect(res.status).toBe(402);
    expect(res.body.error.orderId).toMatch(/^ORD-/);
  });

  test('[API-CHK-006] a gateway outage returns 504', async () => {
    await addToCart(app, token, 'P-1001', 1);
    expect((await placeOrder(app, token, { cardToken: 'tok_timeout' })).status).toBe(504);
  });

  test('[API-CHK-007] a single gateway timeout is retried transparently', async () => {
    await addToCart(app, token, 'P-1001', 1);
    expect((await placeOrder(app, token, { cardToken: 'tok_timeout_once' })).status).toBe(201);
  });

  test('[API-CHK-008] a promo code reduces the total', async () => {
    await addToCart(app, token, 'P-1001', 1);
    const res = await placeOrder(app, token, { cardToken: 'tok_success', promoCode: 'WELCOME10' });
    expect(res.body).toMatchObject({ discount: 9, promoCode: 'WELCOME10' });
  });

  test('[API-CHK-009] an invalid promo code returns 400 and no order is created', async () => {
    await addToCart(app, token, 'P-1001', 1);
    expect((await placeOrder(app, token, { cardToken: 'tok_success', promoCode: 'NOPE' })).status).toBe(400);
    expect(store.state.orders).toHaveLength(0);
  });

  test('[API-CHK-010] express checkout returns 403 while the flag is off', async () => {
    const { config } = require('../../src/config');
    const original = config.featureFlags.expressCheckout;
    config.featureFlags.expressCheckout = false;
    await addToCart(app, token, 'P-1001', 1);
    try {
      expect((await placeOrder(app, token, { express: true })).status).toBe(403);
    } finally {
      config.featureFlags.expressCheckout = original;
    }
  });

  test('[API-CHK-011] a missing card token returns 400', async () => {
    await addToCart(app, token, 'P-1001', 1);
    expect((await placeOrder(app, token, {})).status).toBe(400);
  });

  test('[API-CHK-012] Oregon orders carry no sales tax', async () => {
    await addToCart(app, token, 'P-1001', 1);
    expect((await placeOrder(app, token, { cardToken: 'tok_success', region: 'US-OR' })).body.tax).toBe(0);
  });

  test('[API-CHK-013] checkout requires authentication', async () => {
    expect((await request(app).post('/api/checkout').send({ cardToken: 'tok_success' })).status).toBe(401);
  });
});
