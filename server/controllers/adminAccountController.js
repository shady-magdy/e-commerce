'use strict';

const User = require('../models/User');
const Order = require('../models/Order');
const { asyncHandler, appError } = require('../middleware/errors');

const listAccounts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(40, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = { role: 'customer' };
  const q = String(req.query.q || '').trim().slice(0, 100);
  if (q) filter.$or = [{ name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }];
  const [total, accounts] = await Promise.all([
    User.find(filter).select('_id name email role isActive createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ accounts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
const getAccountOrders = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw appError('Customer not found.', 404);
  const account = await User.findOne({ _id: req.params.id, role: 'customer' }).select('_id name email role isActive createdAt').lean();
  if (!account) throw appError('Customer not found.', 404);
  const orders = await Order.find({ user: account._id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ account, orders });
});
const setAccountActive = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw appError('Customer not found.', 404);
  const isActive = req.body.isActive;
  if (typeof isActive !== 'boolean') throw appError('Account active status must be true or false.');
  const account = await User.findOneAndUpdate({ _id: req.params.id, role: 'customer' }, { $set: { isActive } }, { new: true }).select('_id name email role isActive createdAt');
  if (!account) throw appError('Customer not found.', 404);
  res.json({ account });
});
module.exports = { listAccounts, getAccountOrders, setAccountActive };
