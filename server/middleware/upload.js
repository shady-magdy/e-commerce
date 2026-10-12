'use strict';

const multer = require('multer');
const { appError } = require('./errors');
const acceptedTypes = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
  'application/zip',
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const name = String(file.originalname || '').toLowerCase();
    if (!name.endsWith('.xlsx') || !acceptedTypes.has(file.mimetype)) return callback(appError('Upload a valid Excel .xlsx file.'), false);
    callback(null, true);
  },
});
upload.validateXlsxSignature = (req, res, next) => {
  const buffer = req.file?.buffer;
  if (!buffer || buffer.length < 4 || buffer.subarray(0, 4).toString('hex') !== '504b0304') {
    return next(appError('The uploaded file is not a valid .xlsx workbook.'));
  }
  next();
};
module.exports = upload;
