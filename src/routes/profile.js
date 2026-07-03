'use strict';
const express = require('express');
const profile = require('../services/profileService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => res.json(profile.getProfile(req.user.id)));

router.put('/', (req, res, next) => {
  try {
    res.json(profile.updateProfile(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/addresses', (req, res, next) => {
  try {
    res.status(201).json(profile.addAddress(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
