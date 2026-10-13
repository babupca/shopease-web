'use strict';
const orders = require('../../src/services/orderService');

const sample = (userId = 'U-1') =>
  orders.createOrder({
    userId,
    items: [{ productId: 'P-1001', name: 'Trail Running Shoes', unitPrice: 89.99, qty: 1 }],
    subtotal: 89.99, discount: 0, shipping: 0, tax: 6.52, total: 96.51, region: 'US-CA'
  });

const ALICE = { id: 'U-1', role: 'customer' };
const BOB = { id: 'U-2', role: 'customer' };
const ADMIN = { id: 'U-9', role: 'admin' };

describe('Orders', () => {
  test('[UT-ORD-001] creates an order in PENDING with a sequential id', () => {
    const o = sample();
    expect(o.id).toBe('ORD-1001');
    expect(o.status).toBe('PENDING');
  });

  test('[UT-ORD-002] rejects an order without items', () => {
    expect(() => orders.createOrder({ userId: 'U-1', items: [] })).toThrow(expect.objectContaining({ code: 'EMPTY_ORDER' }));
  });

  test('[UT-ORD-003] owner can read their order', () => {
    const o = sample();
    expect(orders.getOrder(o.id, ALICE).id).toBe(o.id);
  });

  test('[UT-ORD-004] another customer gets 404 for an order they do not own', () => {
    const o = sample();
    expect(() => orders.getOrder(o.id, BOB)).toThrow(expect.objectContaining({ status: 404 }));
  });

  test('[UT-ORD-005] admin can read any order', () => {
    const o = sample();
    expect(orders.getOrder(o.id, ADMIN).userId).toBe('U-1');
  });

  test('[UT-ORD-006] lists only the customer\'s orders, newest first', () => {
    sample('U-1');
    sample('U-2');
    sample('U-1');
    expect(orders.listOrders('U-1').map((o) => o.id)).toEqual(['ORD-1003', 'ORD-1001']);
  });

  test.each([
    { id: 'UT-ORD-007', path: ['PAID'] },
    { id: 'UT-ORD-008', path: ['PAYMENT_FAILED'] },
    { id: 'UT-ORD-009', path: ['PAID', 'SHIPPED'] },
    { id: 'UT-ORD-010', path: ['PAID', 'SHIPPED', 'DELIVERED'] },
    { id: 'UT-ORD-011', path: ['PAYMENT_FAILED', 'CANCELLED'] }
  ])('[$id] allows the status path $path', ({ path }) => {
    const o = sample();
    path.forEach((s) => orders.updateStatus(o.id, s));
    expect(orders.getOrder(o.id).status).toBe(path[path.length - 1]);
  });

  test.each([
    { id: 'UT-ORD-012', path: ['SHIPPED'] },
    { id: 'UT-ORD-013', path: ['PAID', 'DELIVERED'] },
    { id: 'UT-ORD-014', path: ['CANCELLED', 'PAID'] }
  ])('[$id] rejects the invalid status path $path', ({ path }) => {
    const o = sample();
    expect(() => path.forEach((s) => orders.updateStatus(o.id, s))).toThrow(expect.objectContaining({ code: 'INVALID_TRANSITION' }));
  });

  test('[UT-ORD-015] rejects an unknown status', () => {
    const o = sample();
    expect(() => orders.updateStatus(o.id, 'LOST')).toThrow(expect.objectContaining({ code: 'INVALID_STATUS' }));
  });

  test('[UT-ORD-016] records status history', () => {
    const o = sample();
    orders.updateStatus(o.id, 'PAID');
    expect(orders.getOrder(o.id).history.map((h) => h.status)).toEqual(['PENDING', 'PAID']);
  });

  test('[UT-ORD-017] customer can cancel a PAID order', () => {
    const o = sample();
    orders.updateStatus(o.id, 'PAID');
    expect(orders.cancelOrder(o.id, ALICE).status).toBe('CANCELLED');
  });

  test('[UT-ORD-018] a SHIPPED order cannot be cancelled', () => {
    const o = sample();
    orders.updateStatus(o.id, 'PAID');
    orders.updateStatus(o.id, 'SHIPPED');
    expect(() => orders.cancelOrder(o.id, ALICE)).toThrow(expect.objectContaining({ code: 'NOT_CANCELLABLE' }));
  });

  test('[UT-ORD-019] admin listing can filter by status', () => {
    const a = sample();
    sample();
    orders.updateStatus(a.id, 'PAID');
    expect(orders.listAllOrders({ status: 'PAID' }).map((o) => o.id)).toEqual([a.id]);
  });

  test('[UT-ORD-020] a delivered order can be returned with a reason', () => {
    const o = sample();
    ['PAID', 'SHIPPED', 'DELIVERED'].forEach((s) => orders.updateStatus(o.id, s));
    expect(orders.requestReturn(o.id, ALICE, 'Wrong size').status).toBe('RETURNED');
  });

  test('[UT-ORD-021] an order that is not delivered cannot be returned', () => {
    const o = sample();
    orders.updateStatus(o.id, 'PAID');
    expect(() => orders.requestReturn(o.id, ALICE, 'Changed mind')).toThrow(expect.objectContaining({ code: 'NOT_RETURNABLE' }));
  });
});
