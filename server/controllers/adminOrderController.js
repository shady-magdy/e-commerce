'use strict';

const Order = require('../models/Order');
const { asyncHandler, appError } = require('../middleware/errors');

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(40, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (statuses.includes(String(req.query.status))) filter.status = req.query.status;
  const [total, orders] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw appError('Order not found.', 404);
  const status = String(req.body.status || '');
  if (!statuses.includes(status)) throw appError('Choose a valid order status.');
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).populate('user', 'name email');
  if (!order) throw appError('Order not found.', 404);
  res.json({ order });
});
module.exports = { listOrders, updateOrderStatus, statuses };
