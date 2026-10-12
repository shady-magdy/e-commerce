'use strict';

const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler, appError } = require('../middleware/errors');
const { loadCart } = require('./shoppingController');
const { effectiveProductPrice } = require('../services/pricing');

const placeOrder = asyncHandler(async (req, res) => {
  const address = req.body.shippingAddress || {};
  const required = ['name', 'line1', 'city', 'postalCode', 'country'];
  for (const field of required) {
    if (typeof address[field] !== 'string' || !address[field].trim()) throw appError(`Shipping ${field} is required.`);
  }
  const cart = await loadCart(req.user._id);
  if (!cart.items.length) throw appError('Your bag is empty.');

  const reserved = [];
  let createdOrder = null;
  try {
    const items = [];
    let totalAmount = 0;
    for (const line of cart.items) {
      const quantity = Number(line.quantity);
      const product = line.product;
      if (!product) throw appError('A product in your bag is no longer available.');
      const stockUpdate = await Product.findOneAndUpdate(
        { _id: product._id, isAvailable: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true },
      );
      if (!stockUpdate) throw appError(`${product.name} no longer has enough stock.`);
      reserved.push({ id: product._id, quantity });
      if (stockUpdate.stock === 0) await Product.updateOne({ _id: product._id }, { $set: { isAvailable: false } });
      const unitPrice = effectiveProductPrice(stockUpdate);
      items.push({ product: product._id, name: product.name, price: unitPrice, color: line.color, quantity });
      totalAmount += unitPrice * quantity;
    }
    createdOrder = await Order.create({
      user: req.user._id,
      items,
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingAddress: Object.fromEntries(required.map(key => [key, address[key].trim()]).concat([
        ['line2', typeof address.line2 === 'string' ? address.line2.trim() : ''],
        ['phone', typeof address.phone === 'string' ? address.phone.trim() : ''],
      ])),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      paymentMethod: '',
    });
    cart.items = [];
    await cart.save();
    res.status(201).json({ order: createdOrder });
  } catch (error) {
    const compensations = reserved.map(line => Product.findByIdAndUpdate(
      line.id,
      { $inc: { stock: line.quantity }, $set: { isAvailable: true } },
    ));
    if (createdOrder) compensations.push(Order.deleteOne({ _id: createdOrder._id }));
    await Promise.allSettled(compensations);
    throw error;
  }
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ orders });
});
const getMyOrder = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw appError('Order not found.', 404);
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!order) throw appError('Order not found.', 404);
  res.json({ order });
});
module.exports = { placeOrder, listMyOrders, getMyOrder };
