'use strict';

const express = require('express');
const controller = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);
router.post('/', controller.placeOrder);
router.get('/', controller.listMyOrders);
router.get('/:id', controller.getMyOrder);
module.exports = router;
