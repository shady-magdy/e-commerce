'use strict';

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
