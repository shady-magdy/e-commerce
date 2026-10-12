'use strict';

const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { asyncHandler, appError } = require('../middleware/errors');
const { buildFilter } = require('./productController');

const text = value => typeof value === 'string' ? value.trim() : '';
function parseBoolean(value, field) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0' || value == null || value === '') return false;
  throw appError(`${field} must be true or false.`);
}
function readProduct(body) {
  if (body.price == null || String(body.price).trim() === '' || body.stock == null || String(body.stock).trim() === '') {
    throw appError('Price and stock are required.');
  }
  const sku = text(body.sku).toUpperCase();
  const name = text(body.name);
  const description = text(body.description);
  const category = text(body.category);
  const price = Number(body.price);
  const stock = Number(body.stock);
  const discountPercent = body.discountPercent === '' || body.discountPercent == null ? 0 : Number(body.discountPercent);
  const isDiscounted = parseBoolean(body.isDiscounted, 'isDiscounted');
  const isBestSeller = parseBoolean(body.isBestSeller, 'isBestSeller');
  const images = (Array.isArray(body.images) ? body.images : text(body.images).split(',')).map(text).filter(Boolean);
  const colors = (Array.isArray(body.colors) ? body.colors : text(body.colors).split(',')).map(text).filter(Boolean);

  if (!sku || sku.length > 64 || name.length < 2 || name.length > 180 || description.length < 2 || description.length > 3000) {
    throw appError('SKU, name or description is missing or exceeds its allowed length.');
  }
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    throw appError('Enter a valid non-negative price and whole-number stock.');
  }
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 90) throw appError('Discount percent must be between 0 and 90.');
  if (category.length > 80) throw appError('Category name must be 80 characters or fewer.');
  if (images.length > 12 || images.some(image => image.length > 2048)) throw appError('Use at most 12 image URLs, each 2048 characters or fewer.');
  for (const image of images) {
    let url;
    try { url = new URL(image); }
    catch { throw appError('Each image must be a valid HTTP or HTTPS URL.'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw appError('Each image must be a valid HTTP or HTTPS URL.');
  }
  if (colors.length > 16 || colors.some(color => color.length > 40)) throw appError('Use at most 16 colors, each 40 characters or fewer.');

  return {
    sku, name, description, price, category, images, colors,
    isDiscounted, discountPercent: isDiscounted ? discountPercent : 0,
    isBestSeller, stock, isAvailable: stock > 0,
  };
}
async function resolveCategory(value) {
  const key = String(value || '').trim();
  if (!key) throw appError('Choose a product category.');
  const safeName = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const options = [{ slug: key.toLowerCase() }, { name: new RegExp(`^${safeName}$`, 'i') }];
  if (/^[a-f\d]{24}$/i.test(key)) options.push({ _id: key });
  const category = await Category.findOne({ $or: options });
  if (!category) throw appError('Category not found.');
  return category._id;
}
function requireProductId(id) {
  if (!/^[a-f\d]{24}$/i.test(id)) throw appError('Product not found.', 404);
}
const listAdminProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(40, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const query = { ...req.query };
  const q = String(query.q || '').trim().slice(0, 100);
  delete query.q;
  const filter = await buildFilter(query);
  if (q) {
    const skuPrefix = new RegExp(`^${q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&').toUpperCase()}`);
    filter.$or = [{ sku: skuPrefix }, { $text: { $search: q } }];
  }
  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('category', 'name slug').lean(),
    Product.countDocuments(filter),
    Category.find().sort({ name: 1 }).lean(),
  ]);
  res.json({ products, categories, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
const createProduct = asyncHandler(async (req, res) => {
  const data = readProduct(req.body);
  data.category = await resolveCategory(data.category);
  res.status(201).json({ product: await Product.create(data) });
});
const updateProduct = asyncHandler(async (req, res) => {
  requireProductId(req.params.id);
  const data = readProduct(req.body);
  data.category = await resolveCategory(data.category);
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true }).populate('category', 'name slug');
  if (!product) throw appError('Product not found.', 404);
  res.json({ product });
});
const deleteProduct = asyncHandler(async (req, res) => {
  requireProductId(req.params.id);
  const product = await Product.findById(req.params.id);
  if (!product) throw appError('Product not found.', 404);
  await Promise.all([
    Cart.updateMany({ 'items.product': product._id }, { $pull: { items: { product: product._id } } }),
    User.updateMany({ wishlist: product._id }, { $pull: { wishlist: product._id } }),
  ]);
  await Product.deleteOne({ _id: product._id });
  res.json({ message: 'Product deleted.' });
});
module.exports = { listAdminProducts, createProduct, updateProduct, deleteProduct, readProduct };
