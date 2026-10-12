'use strict';

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
  color: { type: String, default: '' }, quantity: { type: Number, required: true, min: 1 },
}, { _id: false });
const addressSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 }, line1: { type: String, required: true, maxlength: 150 },
  line2: { type: String, default: '', maxlength: 150 }, city: { type: String, required: true, maxlength: 100 },
  postalCode: { type: String, required: true, maxlength: 24 }, country: { type: String, required: true, maxlength: 80 },
  phone: { type: String, default: '', maxlength: 32 },
}, { _id: false });
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  totalAmount: { type: Number, required: true, min: 0 }, shippingAddress: { type: addressSchema, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Refunded'], default: 'Unpaid' }, paymentMethod: { type: String, default: '' },
}, { timestamps: true });
orderSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);
