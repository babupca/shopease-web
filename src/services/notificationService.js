'use strict';
const store = require('../data/store');
const { config } = require('../config');
const { formatCurrency } = require('../utils/money');

function send(message) {
  if (!config.notifications.enabled) return null;
  const email = { from: config.notifications.fromAddress, sentAt: new Date().toISOString(), ...message };
  store.state.outbox.push(email);
  return email;
}

function sendOrderConfirmation(user, order) {
  return send({
    to: user.email,
    template: 'order-confirmation',
    subject: `Your ShopEase order ${order.id} is confirmed`,
    body: `Hi ${user.name}, thanks for your order. Total charged: ${formatCurrency(order.total)}.`
  });
}

function sendOrderCancelled(user, order) {
  return send({
    to: user.email,
    template: 'order-cancelled',
    subject: `Your ShopEase order ${order.id} was cancelled`,
    body: `Hi ${user.name}, your order ${order.id} has been cancelled. Any payment will be refunded.`
  });
}

function outbox() {
  return store.state.outbox;
}

module.exports = { sendOrderConfirmation, sendOrderCancelled, outbox };
