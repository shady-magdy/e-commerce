'use strict';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
function appError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
function validateEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500);
  const message = error.code === 11000 ? 'That value already exists.' : status >= 500 ? 'Something went wrong. Please try again.' : error.message;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: message });
}
module.exports = { asyncHandler, appError, validateEmail, errorHandler };
