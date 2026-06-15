'use strict';
const store = require('../data/store');
const { config } = require('../config');
const { AppError } = require('../errors');
const { round2 } = require('../utils/money');
const catalog = require('./catalogService');
const inventory = require('./inventoryService');

function rawCart(userId) {
  if (!store.state.carts[userId]) store.state.carts[userId] = { userId, items: [] };
  return store.state.carts[userId];
}

function validateQty(qty) {
  const max = config.cart.maxQtyPerItem;
  if (typeof qty !== 'number' || Number.isNaN(qty) || qty < 1 || qty > max) {
    throw new AppError(`Quantity must be between 1 and ${max}`, 400, 'INVALID_QUANTITY');
  }
}

function summarize(cart) {
  const items = cart.items.map((line) => ({ ...line, lineTotal: round2(line.unitPrice * line.qty) }));
  return {
    userId: cart.userId,
    items,
    itemCount: items.reduce((n, l) => n + l.qty, 0),
    subtotal: round2(items.reduce((acc, l) => acc + l.unitPrice * l.qty, 0))
  };
}

function getCart(userId) {
  return summarize(rawCart(userId));
}

function addItem(userId, productId, qty = 1) {
  validateQty(qty);
  const product = catalog.getProduct(productId);
  const cart = rawCart(userId);
  const existing = cart.items.find((l) => l.productId === productId);
  const newQty = (existing ? existing.qty : 0) + qty;
  validateQty(newQty);
  if (!inventory.isAvailable(productId, newQty)) {
    throw new AppError(`Only ${product.stock} left in stock`, 409, 'INSUFFICIENT_STOCK');
  }
  if (existing) existing.qty = newQty;
  else {
    if (cart.items.length >= config.cart.maxDistinctItems) throw new AppError('Cart is full', 400, 'CART_FULL');
    cart.items.push({ productId, name: product.name, unitPrice: product.price, qty });
  }
  return summarize(cart);
}

function updateItem(userId, productId, qty) {
  const cart = rawCart(userId);
  const line = cart.items.find((l) => l.productId === productId);
  if (!line) throw new AppError('Item not in cart', 404, 'ITEM_NOT_IN_CART');
  if (qty === 0) return removeItem(userId, productId);
  validateQty(qty);
  if (!inventory.isAvailable(productId, qty)) throw new AppError('Insufficient stock', 409, 'INSUFFICIENT_STOCK');
  line.qty = qty;
  return summarize(cart);
}

function removeItem(userId, productId) {
  const cart = rawCart(userId);
  const before = cart.items.length;
  cart.items = cart.items.filter((l) => l.productId !== productId);
  if (cart.items.length === before) throw new AppError('Item not in cart', 404, 'ITEM_NOT_IN_CART');
  return summarize(cart);
}

function clearCart(userId) {
  rawCart(userId).items = [];
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, validateQty };
