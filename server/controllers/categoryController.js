'use strict';

const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errors');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const results = await Promise.all(categories.map(async category => {
    const [count, products] = await Promise.all([
      Product.countDocuments({ category: category._id }),
      Product.find({ category: category._id }).sort({ isBestSeller: -1, createdAt: -1 }).limit(4).populate('category', 'name slug').lean(),
    ]);
    return { ...category, productCount: count, products };
  }));
  res.json({ categories: results });
});
module.exports = { listCategories };
