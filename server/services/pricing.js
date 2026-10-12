'use strict';

function effectiveProductPrice(product) {
  const price = Number(product?.price) || 0;
  const percent = product?.isDiscounted ? Number(product.discountPercent) || 0 : 0;
  return Number((price * (1 - percent / 100)).toFixed(2));
}

module.exports = { effectiveProductPrice };
