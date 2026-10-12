'use strict';

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler, appError } = require('../middleware/errors');
const { effectiveProductPrice } = require('../services/pricing');
const isMongoId = value => /^[a-f\d]{24}$/i.test(String(value || ''));

async function loadCart(userId, mayRetry = true) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  await cart.populate('items.product', 'sku name price images colors stock isAvailable isDiscounted discountPercent isBestSeller');
  const staleItems = cart.items.filter(item => !item.product).map(item => item._id);
  if (staleItems.length) {
    await Cart.updateOne({ _id: cart._id }, { $pull: { items: { _id: { $in: staleItems } } } });
    if (mayRetry) return loadCart(userId, false);
    cart.items = cart.items.filter(item => item.product);
  }
  return cart;
}
const getCart = asyncHandler(async (req, res) => {
  const cart = await loadCart(req.user._id);
  const total = cart.items.reduce((sum, item) => sum + effectiveProductPrice(item.product) * item.quantity, 0);
  res.json({ cart, total: Number(total.toFixed(2)) });
});
const addCartItem = asyncHandler(async (req, res) => {
  if (!isMongoId(req.body.productId)) throw appError('Product not found.', 404);
  const product = await Product.findById(req.body.productId);
  if (!product) throw appError('Product not found.', 404);
  if (!product.isAvailable || product.stock < 1) throw appError('This product is unavailable.');
  const quantity = Math.max(1, Number.parseInt(req.body.quantity, 10) || 1);
  const color = typeof req.body.color === 'string' && product.colors.includes(req.body.color) ? req.body.color : (product.colors[0] || '');
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const line = cart.items.find(item => String(item.product) === String(product._id) && item.color === color);
  const nextQuantity = (line ? line.quantity : 0) + quantity;
  if (nextQuantity > product.stock) throw appError(`Only ${product.stock} item(s) are in stock.`);
  if (line) line.quantity = nextQuantity;
  else cart.items.push({ product: product._id, color, quantity });
  await cart.save();
  res.status(201).json({ cart: await loadCart(req.user._id) });
});
const updateCartItem = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.itemId)) throw appError('Cart item not found.', 404);
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart && cart.items.id(req.params.itemId);
  if (!item) throw appError('Cart item not found.', 404);
  const product = await Product.findById(item.product);
  const quantity = Number.parseInt(req.body.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1) throw appError('Quantity must be at least 1.');
  if (!product || !product.isAvailable || quantity > product.stock) throw appError(`Only ${product ? product.stock : 0} item(s) are available.`);
  if (req.body.color !== undefined) {
    if (typeof req.body.color !== 'string' || (product.colors.length && !product.colors.includes(req.body.color))) throw appError('Choose an available color.');
    item.color = req.body.color;
  }
  item.quantity = quantity;
  await cart.save();
  res.json({ cart: await loadCart(req.user._id) });
});
const removeCartItem = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.itemId)) throw appError('Cart item not found.', 404);
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || !cart.items.id(req.params.itemId)) throw appError('Cart item not found.', 404);
  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  res.json({ cart: await loadCart(req.user._id) });
});
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'sku name price images colors stock isAvailable isDiscounted discountPercent isBestSeller category').lean();
  const products = (user?.wishlist || []).filter(Boolean);
  if (user && products.length !== user.wishlist.length) {
    await User.updateOne({ _id: req.user._id }, { $set: { wishlist: products.map(product => product._id) } });
  }
  res.json({ products });
});
const addWishlist = asyncHandler(async (req, res) => {
  if (!isMongoId(req.body.productId)) throw appError('Product not found.', 404);
  const product = await Product.findById(req.body.productId).select('_id stock isAvailable');
  if (!product) throw appError('Product not found.', 404);
  if (!product.isAvailable || product.stock < 1) throw appError('This product is unavailable.');
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: product._id } });
  res.status(201).json({ message: 'Saved to your wishlist.' });
});
const removeWishlist = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.productId)) throw appError('Product not found.', 404);
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
  res.json({ message: 'Removed from your wishlist.' });
});
module.exports = { getCart, addCartItem, updateCartItem, removeCartItem, getWishlist, addWishlist, removeWishlist, loadCart };
