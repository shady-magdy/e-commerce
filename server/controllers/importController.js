'use strict';

const ExcelJS = require('exceljs');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler, appError } = require('../middleware/errors');
const { readProduct } = require('./adminProductController');

const headers = ['sku', 'name', 'description', 'category', 'price', 'isDiscounted', 'discountPercent', 'isBestSeller', 'colors', 'stock', 'images'];
const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const boolCell = value => {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].includes(normalized)) return true;
  if (['false', 'no', '0', 'n', ''].includes(normalized)) return false;
  return null;
};
const textCell = value => value == null ? '' : String(value).trim();

const template = asyncHandler(async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');
  sheet.addRow(headers);
  sheet.addRow(['AT-001', 'Sample ceramic vase', 'Hand-finished stoneware vase.', 'Ceramics', 58, true, 10, true, 'Ivory, Olive', 12, 'https://example.com/vase.jpg']);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FF263326' } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.columns = headers.map(header => ({ header, key: header, width: Math.max(18, header.length + 4) }));
  const buffer = await workbook.xlsx.writeBuffer();
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="atelier-products-template.xlsx"',
  });
  res.send(Buffer.from(buffer));
});

const importProducts = asyncHandler(async (req, res) => {
  if (!req.file) throw appError('Choose an .xlsx file to upload.');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) throw appError('The workbook has no product rows.');

  const headerValues = sheet.getRow(1).values.map(value => textCell(value).toLowerCase());
  const positions = Object.fromEntries(headers.map(name => [name, headerValues.indexOf(name.toLowerCase())]));
  const missing = headers.filter(name => positions[name] < 1);
  if (missing.length) throw appError(`Missing spreadsheet columns: ${missing.join(', ')}.`);

  const report = { created: [], updated: [], failed: [] };
  const candidates = [];
  const seenSkus = new Set();
  const seenCategories = new Map();
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    if (!row.hasValues) continue;
    const raw = Object.fromEntries(headers.map(name => [name, row.getCell(positions[name]).value]));
    const isDiscounted = boolCell(raw.isDiscounted);
    const isBestSeller = boolCell(raw.isBestSeller);
    if (isDiscounted === null || isBestSeller === null) {
      report.failed.push({ row: rowNumber, reason: 'isDiscounted and isBestSeller must be true/false.' });
      continue;
    }
    try {
      const body = {
        sku: textCell(raw.sku), name: textCell(raw.name), description: textCell(raw.description),
        category: textCell(raw.category), price: raw.price, stock: raw.stock,
        isDiscounted, discountPercent: raw.discountPercent, isBestSeller,
        colors: textCell(raw.colors), images: textCell(raw.images),
      };
      const product = readProduct(body);
      if (!body.category) throw appError('Category is required.');
      if (seenSkus.has(product.sku)) throw appError('Duplicate SKU in this spreadsheet.');
      seenSkus.add(product.sku);
      const categoryKey = body.category.toLowerCase();
      if (!seenCategories.has(categoryKey)) seenCategories.set(categoryKey, body.category);
      candidates.push({ row: rowNumber, product, categoryKey });
    } catch (error) {
      report.failed.push({ row: rowNumber, reason: error.message });
    }
  }

  const categoryNames = [...seenCategories.values()];
  const categoryOperations = categoryNames.map(name => {
    const slug = slugify(name);
    return slug ? { updateOne: { filter: { slug }, update: { $setOnInsert: { name, slug } }, upsert: true } } : null;
  }).filter(Boolean);
  if (categoryOperations.length) await Category.bulkWrite(categoryOperations, { ordered: false });

  const categorySlugs = categoryNames.map(slugify).filter(Boolean);
  const categoryRecords = await Category.find({ slug: { $in: categorySlugs } }).lean();
  const categoryBySlug = new Map(categoryRecords.map(category => [category.slug, category._id]));
  const operations = [];
  const operationRows = [];
  for (const candidate of candidates) {
    const categoryName = seenCategories.get(candidate.categoryKey);
    const categoryId = categoryBySlug.get(slugify(categoryName));
    if (!categoryId) {
      report.failed.push({ row: candidate.row, reason: 'Could not create or find the product category.' });
      continue;
    }
    const document = { ...candidate.product, category: categoryId };
    operations.push({ updateOne: { filter: { sku: document.sku }, update: { $set: document, $setOnInsert: { createdAt: new Date() } }, upsert: true } });
    operationRows.push(candidate);
  }

  if (operations.length) {
    const result = await Product.bulkWrite(operations, { ordered: false });
    const upserted = result.upsertedIds || {};
    operationRows.forEach((candidate, index) => {
      const record = { row: candidate.row, sku: candidate.product.sku };
      (Object.prototype.hasOwnProperty.call(upserted, index) ? report.created : report.updated).push(record);
    });
  }
  res.json({ report, summary: { created: report.created.length, updated: report.updated.length, failed: report.failed.length } });
});
module.exports = { template, importProducts };
