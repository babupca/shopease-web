'use strict';
const { request, newApp, loginAs, addToCart, placeOrder } = require('../helpers/api');

describe('Admin API', () => {
  let app;
  let orderId;
  let admin;
  beforeEach(async () => {
    app = newApp();
    const alice = await loginAs(app);
    await addToCart(app, alice, 'P-1001', 1);
    orderId = (await placeOrder(app, alice)).body.id;
    admin = await loginAs(app, 'admin');
  });

  test('[API-ADM-001] customers are forbidden from admin endpoints (403)', async () => {
    const bob = await loginAs(app, 'bob');
    expect((await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${bob}`)).status).toBe(403);
  });

  test('[API-ADM-002] admin endpoints require authentication (401)', async () => {
    expect((await request(app).get('/api/admin/orders')).status).toBe(401);
  });

  test('[API-ADM-003] admin lists all orders', async () => {
    expect((await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${admin}`)).body).toHaveLength(1);
  });

  test('[API-ADM-004] admin can ship a PAID order', async () => {
    const res = await request(app).patch(`/api/admin/orders/${orderId}/status`).set('Authorization', `Bearer ${admin}`).send({ status: 'SHIPPED' });
    expect(res.body.status).toBe('SHIPPED');
  });

  test('[API-ADM-005] an invalid transition returns 409', async () => {
    const res = await request(app).patch(`/api/admin/orders/${orderId}/status`).set('Authorization', `Bearer ${admin}`).send({ status: 'DELIVERED' });
    expect(res.status).toBe(409);
  });

  test('[API-ADM-006] admin can filter orders by status', async () => {
    const res = await request(app).get('/api/admin/orders?status=SHIPPED').set('Authorization', `Bearer ${admin}`);
    expect(res.body).toHaveLength(0);
  });
});
