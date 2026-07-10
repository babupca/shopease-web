'use strict';
const cart = require('../../src/services/cartService');

const U = 'U-1';

describe('Cart', () => {
  test('[UT-CART-001] a new cart is empty', () => {
    expect(cart.getCart(U)).toMatchObject({ items: [], itemCount: 0, subtotal: 0 });
  });

  test('[UT-CART-002] adds an item with unit price and line total', () => {
    const c = cart.addItem(U, 'P-1003', 2);
    expect(c.items[0]).toMatchObject({ productId: 'P-1003', qty: 2, unitPrice: 14.99, lineTotal: 29.98 });
  });

  test('[UT-CART-003] adding the same product merges quantities', () => {
    cart.addItem(U, 'P-1003', 2);
    const c = cart.addItem(U, 'P-1003', 3);
    expect(c.items).toHaveLength(1);
    expect(c.items[0].qty).toBe(5);
  });

  test.each([
    { id: 'UT-CART-004', qty: 0, label: 'zero' },
    { id: 'UT-CART-005', qty: 11, label: 'above the maximum of 10' },
    { id: 'UT-CART-006', qty: -2, label: 'negative' },
    { id: 'UT-CART-007', qty: '2', label: 'a string' }
  ])('[$id] rejects a quantity that is $label', ({ qty }) => {
    expect(() => cart.addItem(U, 'P-1003', qty)).toThrow(expect.objectContaining({ code: 'INVALID_QUANTITY' }));
  });

  test('[UT-CART-008] rejects a merged quantity above the maximum', () => {
    cart.addItem(U, 'P-1003', 8);
    expect(() => cart.addItem(U, 'P-1003', 3)).toThrow(expect.objectContaining({ code: 'INVALID_QUANTITY' }));
  });

  test('[UT-CART-009] rejects an out-of-stock product', () => {
    expect(() => cart.addItem(U, 'P-1011', 1)).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }));
  });

  test('[UT-CART-010] rejects a quantity above available stock', () => {
    expect(() => cart.addItem(U, 'P-1006', 4)).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }));
  });

  test('[UT-CART-011] rejects an unknown product', () => {
    expect(() => cart.addItem(U, 'P-9999', 1)).toThrow(expect.objectContaining({ status: 404 }));
  });

  test('[UT-CART-012] rejects an inactive product', () => {
    expect(() => cart.addItem(U, 'P-1012', 1)).toThrow(expect.objectContaining({ code: 'PRODUCT_NOT_FOUND' }));
  });

  test('[UT-CART-013] updates the quantity of a line', () => {
    cart.addItem(U, 'P-1001', 1);
    expect(cart.updateItem(U, 'P-1001', 3).items[0].qty).toBe(3);
  });

  test('[UT-CART-014] updating a quantity to 0 removes the line', () => {
    cart.addItem(U, 'P-1001', 1);
    expect(cart.updateItem(U, 'P-1001', 0).items).toHaveLength(0);
  });

  test('[UT-CART-015] updating a missing line returns 404', () => {
    expect(() => cart.updateItem(U, 'P-1001', 2)).toThrow(expect.objectContaining({ code: 'ITEM_NOT_IN_CART' }));
  });

  test('[UT-CART-016] removes a line', () => {
    cart.addItem(U, 'P-1001', 1);
    cart.addItem(U, 'P-1004', 1);
    expect(cart.removeItem(U, 'P-1001').items.map((l) => l.productId)).toEqual(['P-1004']);
  });

  test('[UT-CART-017] removing a missing line returns 404', () => {
    expect(() => cart.removeItem(U, 'P-1001')).toThrow(expect.objectContaining({ status: 404 }));
  });

  test('[UT-CART-018] computes subtotal and item count across lines', () => {
    cart.addItem(U, 'P-1001', 1);
    const c = cart.addItem(U, 'P-1003', 2);
    expect(c.subtotal).toBe(119.97);
    expect(c.itemCount).toBe(3);
  });

  test('[UT-CART-019] clearCart empties the cart', () => {
    cart.addItem(U, 'P-1001', 1);
    cart.clearCart(U);
    expect(cart.getCart(U).items).toHaveLength(0);
  });

  test('[UT-CART-020] carts are isolated per user', () => {
    cart.addItem(U, 'P-1001', 1);
    expect(cart.getCart('U-2').items).toHaveLength(0);
  });
});
