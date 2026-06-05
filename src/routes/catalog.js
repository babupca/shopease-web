'use strict';
const express = require('express');
const catalog = require('../services/catalogService');
const inventory = require('../services/inventoryService');

const router = express.Router();

router.get('/products', (req, res, next) => {
  try {
    res.json(catalog.listProducts(req.query));
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', (req, res, next) => {
  try {
    const product = catalog.getProduct(req.params.id);
    res.json({ ...product, inStock: inventory.getStock(product.id) > 0 });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', (req, res) => res.json(catalog.listCategories()));

module.exports = router;
