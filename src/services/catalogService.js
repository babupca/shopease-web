'use strict';
const store = require('../data/store');
const { AppError } = require('../errors');

const MAX_PAGE_SIZE = 50;

/**
 * List active products with optional filtering, sorting and pagination.
 * @param {object} [query] category, search, sort, minPrice, maxPrice, page, pageSize
 * @returns {{items: object[], page: number, pageSize: number, total: number}}
 */
function listProducts({ category, search, sort, minPrice, maxPrice, page = 1, pageSize = 10 } = {}) {
  let items = store.state.products.filter((p) => p.active);
  if (category) items = items.filter((p) => p.category === category);
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (minPrice !== undefined) items = items.filter((p) => p.price >= Number(minPrice));
  if (maxPrice !== undefined) items = items.filter((p) => p.price <= Number(maxPrice));

  if (sort === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);
  else if (sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating || a.price - b.price);
  else if (sort) throw new AppError(`Unsupported sort: ${sort}`, 400, 'INVALID_SORT');

  const size = Math.min(Math.max(1, Number(pageSize) || 10), MAX_PAGE_SIZE);
  const current = Math.max(1, Number(page) || 1);
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pageSize: size,
    total: items.length
  };
}

/**
 * Fetch a single active product.
 * @throws {AppError} 404 PRODUCT_NOT_FOUND when missing or inactive
 */
function getProduct(id) {
  const product = store.state.products.find((p) => p.id === id && p.active);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return product;
}

function listCategories() {
  return [...new Set(store.state.products.filter((p) => p.active).map((p) => p.category))].sort();
}

module.exports = { listProducts, getProduct, listCategories, MAX_PAGE_SIZE };
