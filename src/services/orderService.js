'use strict';
const store = require('../data/store');
const { AppError } = require('../errors');

const STATUSES = ['PENDING', 'PAID', 'PAYMENT_FAILED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const RETURN_WINDOW_DAYS = 30;

const TRANSITIONS = {
  PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  PAYMENT_FAILED: ['CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: []
};

function createOrder({ userId, items, subtotal, discount, shipping, tax, total, region, promoCode }) {
  if (!items || items.length === 0) throw new AppError('Order must contain items', 400, 'EMPTY_ORDER');
  store.state.orderSeq += 1;
  const order = {
    id: `ORD-${store.state.orderSeq}`,
    userId,
    items: items.map((l) => ({ productId: l.productId, name: l.name, unitPrice: l.unitPrice, qty: l.qty })),
    subtotal,
    discount,
    shipping,
    tax,
    total,
    region,
    promoCode: promoCode || null,
    status: 'PENDING',
    history: [{ status: 'PENDING', at: new Date().toISOString() }],
    createdAt: new Date().toISOString()
  };
  store.state.orders.push(order);
  return order;
}

function findOrder(id) {
  const order = store.state.orders.find((o) => o.id === id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  return order;
}

function getOrder(id, user) {
  const order = findOrder(id);
  if (user && user.role !== 'admin' && order.userId !== user.id) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }
  return order;
}

function listOrders(userId) {
  return store.state.orders.filter((o) => o.userId === userId).sort((a, b) => (a.id < b.id ? 1 : -1));
}

function listAllOrders({ status } = {}) {
  return status ? store.state.orders.filter((o) => o.status === status) : [...store.state.orders];
}

function updateStatus(id, status) {
  if (!STATUSES.includes(status)) throw new AppError(`Unknown status ${status}`, 400, 'INVALID_STATUS');
  const order = findOrder(id);
  if (!TRANSITIONS[order.status].includes(status)) {
    throw new AppError(`Cannot move order from ${order.status} to ${status}`, 409, 'INVALID_TRANSITION');
  }
  order.status = status;
  order.history.push({ status, at: new Date().toISOString() });
  return order;
}

function cancelOrder(id, user) {
  const order = getOrder(id, user);
  if (!['PENDING', 'PAID'].includes(order.status)) {
    throw new AppError(`Order in status ${order.status} cannot be cancelled`, 409, 'NOT_CANCELLABLE');
  }
  return updateStatus(id, 'CANCELLED');
}

function requestReturn(id, user, reason, now = new Date()) {
  const order = getOrder(id, user);
  if (order.status !== 'DELIVERED') throw new AppError('Only delivered orders can be returned', 409, 'NOT_RETURNABLE');
  if (!reason || !String(reason).trim()) throw new AppError('A return reason is required', 400, 'VALIDATION_ERROR');
  const delivered = [...order.history].reverse().find((h) => h.status === 'DELIVERED');
  const ageDays = (now - new Date(delivered.at)) / 86400000;
  if (ageDays > RETURN_WINDOW_DAYS) throw new AppError('Return window has closed', 409, 'RETURN_WINDOW_EXPIRED');
  order.returnReason = String(reason).trim();
  order.returnedAt = now.toISOString();
  return updateStatus(id, 'RETURNED');
}

module.exports = { createOrder, getOrder, listOrders, listAllOrders, updateStatus, cancelOrder, requestReturn, STATUSES, TRANSITIONS, RETURN_WINDOW_DAYS };
