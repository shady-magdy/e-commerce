'use strict';

const User = require('../models/User');
const { asyncHandler, appError, validateEmail } = require('../middleware/errors');
const { setSessionCookie, clearSessionCookie } = require('../middleware/auth');

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, isActive: user.isActive };
}

const signup = asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (name.length < 2 || name.length > 100) throw appError('Enter a name between 2 and 100 characters.');
  if (!validateEmail(email)) throw appError('Enter a valid email address.');
  if (password.length < 8 || password.length > 128) throw appError('Password must be at least 8 characters.');
  const user = await User.create({ name, email, password, role: 'customer' });
  setSessionCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!validateEmail(email) || !password) throw appError('Enter your email and password.');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw appError('Email or password is incorrect.', 401);
  if (!user.isActive) throw appError('This account is inactive. Please contact the store.', 403);
  setSessionCookie(res, user);
  res.json({ user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }));
const logout = asyncHandler(async (req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'You are signed out.' });
});

module.exports = { signup, login, me, logout, publicUser };
