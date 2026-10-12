'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, appError } = require('./errors');

const COOKIE_NAME = 'atelier_session';
const cookieOptions = () => {
  // Preview is public HTTPS even though its upstream Express request may be HTTP.
  const localHttp = process.env.COOKIE_SECURE === 'false';
  return {
    httpOnly: true,
    secure: !localHttp,
    sameSite: localHttp ? 'lax' : 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};
function setSessionCookie(res, user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw appError('JWT_SECRET is not configured.', 503);
  const token = jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, cookieOptions());
}
function clearSessionCookie(res) {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(COOKIE_NAME, options);
}
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) throw appError('Please sign in to continue.', 401);
  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    throw appError('Your session has expired. Please sign in again.', 401);
  }
  const user = await User.findById(claims.sub).select('_id name email role isActive wishlist');
  if (!user || !user.isActive) throw appError('This account is unavailable.', 401);
  req.user = user;
  next();
});
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return next(appError('Administrator access required.', 403));
  next();
}
module.exports = { requireAuth, requireAdmin, setSessionCookie, clearSessionCookie };
