'use strict';
const request = require('supertest');
const { createApp } = require('../../src/app');

const USERS = {
  alice: { email: 'alice@shopease.example', password: 'Passw0rd!' },
  bob: { email: 'bob@shopease.example', password: 'Passw0rd!' },
  olga: { email: 'olga@shopease.example', password: 'Passw0rd!' },
  admin: { email: 'admin@shopease.example', password: 'Adm1nPass!' }
};

function newApp() {
  return createApp();
}

async function loginAs(app, who = 'alice') {
  const res = await request(app).post('/api/auth/login').send(USERS[who]);
  return res.body.token;
}

async function addToCart(app, token, productId, qty = 1) {
  return request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId, qty });
}

async function placeOrder(app, token, body = { cardToken: 'tok_success' }) {
  return request(app).post('/api/checkout').set('Authorization', `Bearer ${token}`).send(body);
}

module.exports = { request, newApp, loginAs, addToCart, placeOrder, USERS };
