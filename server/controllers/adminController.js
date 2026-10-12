'use strict';

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errors');

const dashboard = asyncHandler(async (req, res) => {
  const [products, orders, customers, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email').lean(),
  ]);
  res.json({ counts: { products, orders, customers }, recentOrders });
});
module.exports = { dashboard };
