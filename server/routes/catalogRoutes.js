'use strict';

const express = require('express');
const { listCategories } = require('../controllers/categoryController');
const { listProducts, getProduct } = require('../controllers/productController');
const router = express.Router();
router.get('/categories', listCategories);
router.get('/products', listProducts);
router.get('/products/:id', getProduct);
module.exports = router;
