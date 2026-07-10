'use strict';
const { request, newApp, loginAs, addToCart } = require('../helpers/api');

describe('Cart API', () => {
  let app;
  let token;
  beforeEach(async () => {
    app = newApp();
    token = await loginAs(app);
  });
  const auth = () => ({ Authorization: `Bearer ${token}` });

  test('[API-CART-001] cart endpoints require authentication', async () => {
    expect((await request(app).get('/api/cart')).status).toBe(401);
  });

  test('[API-CART-002] POST /cart/items adds an item (201)', async () => {
    const res = await addToCart(app, token, 'P-1001', 2);
    expect(res.status).toBe(201);
    expect(res.body.subtotal).toBe(179.98);
  });

  test('[API-CART-003] qty defaults to 1', async () => {
    const res = await request(app).post('/api/cart/items').set(auth()).send({ productId: 'P-1003' });
    expect(res.body.items[0].qty).toBe(1);
  });

  test('[API-CART-004] an invalid quantity returns 400', async () => {
    const res = await addToCart(app, token, 'P-1001', 11);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUANTITY');
  });

  test('[API-CART-005] an unknown product returns 404', async () => {
    expect((await addToCart(app, token, 'P-0000', 1)).status).toBe(404);
  });

  test('[API-CART-006] an out-of-stock product returns 409', async () => {
    expect((await addToCart(app, token, 'P-1011', 1)).status).toBe(409);
  });

  test('[API-CART-007] PATCH /cart/items/:id changes the quantity', async () => {
    await addToCart(app, token, 'P-1001', 1);
    const res = await request(app).patch('/api/cart/items/P-1001').set(auth()).send({ qty: 4 });
    expect(res.body.items[0].qty).toBe(4);
  });

  test('[API-CART-008] PATCH with qty 0 removes the line', async () => {
    await addToCart(app, token, 'P-1001', 1);
    const res = await request(app).patch('/api/cart/items/P-1001').set(auth()).send({ qty: 0 });
    expect(res.body.items).toHaveLength(0);
  });

  test('[API-CART-009] DELETE /cart/items/:id removes the line', async () => {
    await addToCart(app, token, 'P-1001', 1);
    expect((await request(app).delete('/api/cart/items/P-1001').set(auth())).body.items).toHaveLength(0);
  });

  test('[API-CART-010] deleting a line not in the cart returns 404', async () => {
    expect((await request(app).delete('/api/cart/items/P-1001').set(auth())).status).toBe(404);
  });

  test('[API-CART-011] GET /cart returns lines, count and subtotal', async () => {
    await addToCart(app, token, 'P-1003', 2);
    const res = await request(app).get('/api/cart').set(auth());
    expect(res.body).toMatchObject({ itemCount: 2, subtotal: 29.98 });
  });
});
