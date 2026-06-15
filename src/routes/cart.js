'use strict';
const express = require('express');
const cart = require('../services/cartService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const wrap = (fn) => (req, res, next) => {
  try {
    fn(req, res);
  } catch (err) {
    next(err);
  }
};

router.get('/', wrap((req, res) => res.json(cart.getCart(req.user.id))));
router.post('/items', wrap((req, res) => res.status(201).json(cart.addItem(req.user.id, req.body.productId, req.body.qty ?? 1))));
router.patch('/items/:productId', wrap((req, res) => res.json(cart.updateItem(req.user.id, req.params.productId, req.body.qty))));
router.delete('/items/:productId', wrap((req, res) => res.json(cart.removeItem(req.user.id, req.params.productId))));

module.exports = router;
