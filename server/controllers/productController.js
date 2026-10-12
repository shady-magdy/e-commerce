'use strict';

const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler, appError } = require('../middleware/errors');

async function buildFilter(query) {
  const filter = {};
  const category = String(query.category || '').trim();
  if (category) {
    const match = await Category.findOne({ $or: [{ slug: category.toLowerCase() }, ...( /^[a-f\d]{24}$/i.test(category) ? [{ _id: category }] : [])] }).select('_id');
    if (!match) return { _id: null };
    filter.category = match._id;
  }
  if (query.discounted === 'true') filter.isDiscounted = true;
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.available === 'true') filter.isAvailable = true;
  if (query.q) {
    const q = String(query.q).trim().slice(0, 100);
    if (q) filter.$text = { $search: q };
  }
  return filter;
}

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(40, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = await buildFilter(req.query);
  const sortName = String(req.query.sort || 'featured');
  const sort = sortName === 'price-asc' ? { price: 1, _id: 1 }
    : sortName === 'price-desc' ? { price: -1, _id: 1 }
      : sortName === 'newest' ? { createdAt: -1, _id: -1 }
        : { isBestSeller: -1, createdAt: -1, _id: -1 };
  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(filter.$text ? { score: { $meta: 'textScore' }, ...sort } : sort)
      .skip((page - 1) * limit).limit(limit).populate('category', 'name slug').lean(),
  ]);
  res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const getProduct = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw appError('Product not found.', 404);
  const product = await Product.findById(req.params.id).populate('category', 'name slug').lean();
  if (!product) throw appError('Product not found.', 404);
  res.json({ product });
});
module.exports = { listProducts, getProduct, buildFilter };
