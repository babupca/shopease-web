'use strict';
const store = require('../data/store');
const { AppError } = require('../errors');

function getStock(productId) {
  const product = store.state.products.find((p) => p.id === productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return product.stock;
}

function isAvailable(productId, qty) {
  return getStock(productId) >= qty;
}

/** Reserve stock for all lines atomically: either every line is reserved or none. */
function reserve(items) {
  for (const line of items) {
    if (!isAvailable(line.productId, line.qty)) {
      throw new AppError(`Insufficient stock for ${line.productId}`, 409, 'OUT_OF_STOCK');
    }
  }
  for (const line of items) {
    store.state.products.find((p) => p.id === line.productId).stock -= line.qty;
  }
}

function release(items) {
  for (const line of items) {
    const product = store.state.products.find((p) => p.id === line.productId);
    if (product) product.stock += line.qty;
  }
}

module.exports = { getStock, isAvailable, reserve, release };
