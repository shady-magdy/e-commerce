'use strict';

const express = require('express');
const controller = require('../controllers/shoppingController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);
router.get('/cart', controller.getCart);
router.post('/cart/items', controller.addCartItem);
router.patch('/cart/items/:itemId', controller.updateCartItem);
router.delete('/cart/items/:itemId', controller.removeCartItem);
router.get('/wishlist', controller.getWishlist);
router.post('/wishlist', controller.addWishlist);
router.delete('/wishlist/:productId', controller.removeWishlist);
module.exports = router;
