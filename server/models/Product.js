'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 64 },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  images: [{ type: String, trim: true }],
  colors: [{ type: String, trim: true, maxlength: 40 }],
  isDiscounted: { type: Boolean, default: false, index: true },
  discountPercent: { type: Number, min: 0, max: 90, default: 0 },
  isBestSeller: { type: Boolean, default: false, index: true },
  stock: { type: Number, min: 0, default: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

productSchema.index({ name: 'text' });
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.pre('validate', function syncAvailability() {
  this.isAvailable = this.stock > 0;
  if (!this.isDiscounted) this.discountPercent = 0;
});

module.exports = mongoose.model('Product', productSchema);
