'use strict';
const store = require('../data/store');
const { config } = require('../config');
const { AppError } = require('../errors');
const { round2 } = require('../utils/money');
const cartService = require('./cartService');
const inventory = require('./inventoryService');
const promoService = require('./promoService');
const taxService = require('./taxService');
const orderService = require('./orderService');
const paymentService = require('./payments/paymentService');
const notifications = require('./notificationService');

function calculateTotals(cart, { promoCode, region }) {
  const subtotal = cart.subtotal;
  const promo = promoService.applyPromo(promoCode, subtotal);
  const discounted = round2(subtotal - promo.discount);
  const shipping =
    promo.freeShipping || discounted >= config.shipping.freeShippingThreshold ? 0 : config.shipping.flatRate;
  const tax = taxService.calculateTax(discounted, region);
  const total = round2(discounted + shipping + tax);
  return { subtotal, discount: promo.discount, promoCode: promo.code, shipping, tax, total, region };
}

function quote(userId, { promoCode, region } = {}) {
  const user = store.state.users.find((u) => u.id === userId);
  const cart = cartService.getCart(userId);
  if (cart.items.length === 0) throw new AppError('Cart is empty', 400, 'EMPTY_CART');
  return calculateTotals(cart, { promoCode, region: region || user.region });
}

async function checkout(userId, { cardToken, promoCode, region, express = false } = {}) {
  const user = store.state.users.find((u) => u.id === userId);
  const cart = cartService.getCart(userId);
  if (cart.items.length === 0) throw new AppError('Cart is empty', 400, 'EMPTY_CART');

  let token = cardToken;
  if (express) {
    if (!config.featureFlags.expressCheckout) {
      throw new AppError('Express checkout is not enabled', 403, 'FEATURE_DISABLED');
    }
    if (!user.savedCardToken) throw new AppError('No saved card for express checkout', 400, 'NO_SAVED_CARD');
    token = user.savedCardToken;
  }
  if (!token) throw new AppError('Card token is required', 400, 'CARD_TOKEN_REQUIRED');

  const totals = calculateTotals(cart, { promoCode, region: region || user.region });
  inventory.reserve(cart.items);
  const order = orderService.createOrder({ userId, items: cart.items, ...totals });

  try {
    const payment = await paymentService.authorizePayment({
      orderId: order.id,
      amount: totals.total,
      currency: config.app.currency,
      cardToken: token
    });
    order.payment = { authorizationId: payment.authorizationId, attempts: payment.attempts };
    orderService.updateStatus(order.id, 'PAID');
  } catch (err) {
    inventory.release(cart.items);
    orderService.updateStatus(order.id, 'PAYMENT_FAILED');
    err.orderId = order.id;
    throw err;
  }

  cartService.clearCart(userId);
  notifications.sendOrderConfirmation(user, order);
  return order;
}

module.exports = { checkout, quote, calculateTotals };
