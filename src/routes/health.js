'use strict';
const express = require('express');
const { config } = require('../config');
const pkg = require('../../package.json');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'UP', app: config.app.name, version: pkg.version, env: config.env, features: config.featureFlags });
});

module.exports = router;
