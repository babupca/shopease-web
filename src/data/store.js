'use strict';
/**
 * In-memory data store seeded with demo data.
 * Mirrors the tables defined in db/migrations so the app runs without a database.
 */

const seedProducts = [
  { id: 'P-1001', name: 'Trail Running Shoes', category: 'Footwear', price: 89.99, rating: 4.6, stock: 25, description: 'Lightweight shoes for off-road running', active: true },
  { id: 'P-1002', name: 'Waterproof Hiking Boots', category: 'Footwear', price: 149.5, rating: 4.8, stock: 12, description: 'Leather boots with waterproof membrane', active: true },
  { id: 'P-1003', name: 'Merino Wool Socks', category: 'Apparel', price: 14.99, rating: 4.4, stock: 200, description: 'Breathable merino socks, pack of two', active: true },
  { id: 'P-1004', name: 'Insulated Water Bottle', category: 'Accessories', price: 24.0, rating: 4.7, stock: 80, description: 'Keeps drinks cold for 24 hours', active: true },
  { id: 'P-1005', name: 'Packable Rain Jacket', category: 'Apparel', price: 119.0, rating: 4.3, stock: 30, description: 'Windproof jacket that packs into its pocket', active: true },
  { id: 'P-1006', name: 'Headlamp 400 Lumen', category: 'Accessories', price: 34.95, rating: 4.5, stock: 3, description: 'Rechargeable headlamp with red light mode', active: true },
  { id: 'P-1007', name: 'Trekking Poles (Pair)', category: 'Gear', price: 59.0, rating: 4.2, stock: 40, description: 'Collapsible aluminium trekking poles', active: true },
  { id: 'P-1008', name: 'Daypack 22L', category: 'Gear', price: 79.0, rating: 4.6, stock: 18, description: 'Ventilated daypack with hydration sleeve', active: true },
  { id: 'P-1009', name: 'Camping Mug', category: 'Accessories', price: 1.005, rating: 3.9, stock: 500, description: 'Promotional enamel mug', active: true },
  { id: 'P-1010', name: 'Ultralight Tent 2P', category: 'Gear', price: 329.0, rating: 4.9, stock: 6, description: 'Two-person freestanding tent', active: true },
  { id: 'P-1011', name: 'Sun Hat', category: 'Apparel', price: 22.5, rating: 4.1, stock: 0, description: 'UPF 50 wide-brim hat', active: true },
  { id: 'P-1012', name: 'Legacy Compass', category: 'Accessories', price: 12.0, rating: 3.5, stock: 10, description: 'Discontinued baseplate compass', active: false }
];

const seedUsers = [
  { id: 'U-1', email: 'alice@shopease.example', password: 'Passw0rd!', name: 'Alice Shopper', role: 'customer', region: 'US-CA', savedCardToken: 'tok_success', addresses: [] },
  { id: 'U-2', email: 'bob@shopease.example', password: 'Passw0rd!', name: 'Bob Buyer', role: 'customer', region: 'US-NY', savedCardToken: null, addresses: [] },
  { id: 'U-3', email: 'olga@shopease.example', password: 'Passw0rd!', name: 'Olga Oregon', role: 'customer', region: 'US-OR', savedCardToken: 'tok_success', addresses: [] },
  { id: 'U-9', email: 'admin@shopease.example', password: 'Adm1nPass!', name: 'Store Admin', role: 'admin', region: 'US-CA', savedCardToken: null, addresses: [] }
];

let state;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function reset() {
  state = {
    products: clone(seedProducts),
    users: clone(seedUsers),
    carts: {},
    orders: [],
    outbox: [],
    sessions: {},
    loginAttempts: {},
    orderSeq: 1000
  };
}

reset();

module.exports = {
  get state() {
    return state;
  },
  reset
};
