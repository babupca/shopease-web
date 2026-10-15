'use strict';
const { request, newApp, loginAs, addToCart, placeOrder } = require('../helpers/api');
const store = require('../../src/data/store');

describe('Orders API', () => {
  let app;
  let token;
  let orderId;
  beforeEach(async () => {
    app = newApp();
    token = await loginAs(app);
    await addToCart(app, token, 'P-1001', 1);
    orderId = (await placeOrder(app, token)).body.id;
  });
  const auth = (t = token) => ({ Authorization: `Bearer ${t}` });

  test('[API-ORD-001] GET /orders lists my orders', async () => {
    const res = await request(app).get('/api/orders').set(auth());
    expect(res.body.map((o) => o.id)).toEqual([orderId]);
  });

  test('[API-ORD-002] GET /orders/:id returns the order with total', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`).set(auth());
    expect(res.body).toMatchObject({ id: orderId, status: 'PAID' });
    expect(typeof res.body.totalAmount).toBe('number');
  });

  test('[API-ORD-003] another customer cannot read my order (404)', async () => {
    const bob = await loginAs(app, 'bob');
    expect((await request(app).get(`/api/orders/${orderId}`).set(auth(bob))).status).toBe(404);
  });

  test('[API-ORD-004] cancelling a PAID order returns CANCELLED and emails the customer', async () => {
    const res = await request(app).post(`/api/orders/${orderId}/cancel`).set(auth());
    expect(res.body.status).toBe('CANCELLED');
    expect(store.state.outbox.map((m) => m.template)).toContain('order-cancelled');
  });

  test('[API-ORD-005] cancelling twice returns 409', async () => {
    await request(app).post(`/api/orders/${orderId}/cancel`).set(auth());
    expect((await request(app).post(`/api/orders/${orderId}/cancel`).set(auth())).status).toBe(409);
  });

  test('[API-ORD-006] an unknown order returns 404', async () => {
    expect((await request(app).get('/api/orders/ORD-9999').set(auth())).status).toBe(404);
  });

  test('[API-ORD-007] order list responses never expose internal fields', async () => {
    const [order] = (await request(app).get('/api/orders').set(auth())).body;
    expect(order).not.toHaveProperty('userId');
    expect(order).not.toHaveProperty('history');
  });
});
