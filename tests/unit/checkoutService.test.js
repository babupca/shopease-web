'use strict';
const checkout = require('../../src/services/checkoutService');
const cart = require('../../src/services/cartService');
const inventory = require('../../src/services/inventoryService');
const notifications = require('../../src/services/notificationService');
const store = require('../../src/data/store');

const U = 'U-1';

describe('Checkout totals', () => {
  test('[UT-CHK-001] adds flat-rate shipping below the free-shipping threshold', () => {
    cart.addItem(U, 'P-1003', 1);
    expect(checkout.quote(U).shipping).toBe(5.99);
  });

  test('[UT-CHK-002] shipping is free at or above the threshold', () => {
    cart.addItem(U, 'P-1001', 1);
    expect(checkout.quote(U).shipping).toBe(0);
  });

  test('[UT-CHK-003] discount is applied before tax', () => {
    cart.addItem(U, 'P-1001', 1);
    const q = checkout.quote(U, { promoCode: 'WELCOME10' });
    expect(q).toMatchObject({ subtotal: 89.99, discount: 9, tax: 5.87, total: 86.86 });
  });

  test('[UT-CHK-004] FREESHIP removes shipping on a small order', () => {
    cart.addItem(U, 'P-1003', 1);
    expect(checkout.quote(U, { promoCode: 'FREESHIP' }).shipping).toBe(0);
  });

  test('[UT-CHK-005] uses the customer profile region when none is supplied', () => {
    cart.addItem('U-3', 'P-1001', 1);
    expect(checkout.quote('U-3')).toMatchObject({ region: 'US-OR', tax: 0 });
  });

  test('[UT-CHK-006] quoting an empty cart is rejected', () => {
    expect(() => checkout.quote(U)).toThrow(expect.objectContaining({ code: 'EMPTY_CART' }));
  });
});

describe('Checkout placement', () => {
  test('[UT-CHK-007] successful checkout pays the order, clears the cart, reserves stock and emails the customer', async () => {
    cart.addItem(U, 'P-1001', 2);
    const order = await checkout.checkout(U, { cardToken: 'tok_success' });
    expect(order.status).toBe('PAID');
    expect(cart.getCart(U).items).toHaveLength(0);
    expect(inventory.getStock('P-1001')).toBe(23);
    expect(notifications.outbox()).toHaveLength(1);
  });

  test('[UT-CHK-008] a declined card marks the order PAYMENT_FAILED and releases stock', async () => {
    cart.addItem(U, 'P-1001', 2);
    await expect(checkout.checkout(U, { cardToken: 'tok_decline' })).rejects.toMatchObject({ code: 'PAYMENT_DECLINED' });
    expect(store.state.orders[0].status).toBe('PAYMENT_FAILED');
    expect(inventory.getStock('P-1001')).toBe(25);
    expect(cart.getCart(U).items).toHaveLength(1);
  });

  test('[UT-CHK-009] checkout succeeds after a transient gateway timeout', async () => {
    cart.addItem(U, 'P-1004', 1);
    const order = await checkout.checkout(U, { cardToken: 'tok_timeout_once' });
    expect(order.payment.attempts).toBe(2);
  });

  test('[UT-CHK-010] a persistent gateway timeout fails checkout with 504', async () => {
    cart.addItem(U, 'P-1004', 1);
    await expect(checkout.checkout(U, { cardToken: 'tok_timeout' })).rejects.toMatchObject({ status: 504 });
  });

  test('[UT-CHK-011] a card token is required', async () => {
    cart.addItem(U, 'P-1004', 1);
    await expect(checkout.checkout(U, {})).rejects.toMatchObject({ code: 'CARD_TOKEN_REQUIRED' });
  });

  test('[UT-CHK-012] express checkout is refused while the feature flag is off', async () => {
    cart.addItem(U, 'P-1004', 1);
    const { config } = require('../../src/config');
    const original = config.featureFlags.expressCheckout;
    config.featureFlags.expressCheckout = false;
    try {
      await expect(checkout.checkout(U, { express: true })).rejects.toMatchObject({ code: 'FEATURE_DISABLED' });
    } finally {
      config.featureFlags.expressCheckout = original;
    }
  });

  test('[UT-CHK-013] stock sold out between add-to-cart and checkout is rejected', async () => {
    cart.addItem(U, 'P-1006', 3);
    store.state.products.find((p) => p.id === 'P-1006').stock = 1;
    await expect(checkout.checkout(U, { cardToken: 'tok_success' })).rejects.toMatchObject({ code: 'OUT_OF_STOCK' });
  });

  test('[UT-CHK-014] checkout of an empty cart is rejected', async () => {
    await expect(checkout.checkout(U, { cardToken: 'tok_success' })).rejects.toMatchObject({ code: 'EMPTY_CART' });
  });
});
