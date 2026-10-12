'use strict';

const mongoose = require('mongoose');
const models = [
  require('../models/User'),
  require('../models/Category'),
  require('../models/Product'),
  require('../models/Cart'),
  require('../models/Order'),
];

// Avoid long buffered API requests when MongoDB is not configured or reachable.
mongoose.set('bufferCommands', false);

async function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required. See .env.example and README.md.');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: process.env.NODE_ENV !== 'production',
  });
  // createIndexes adds declared indexes without dropping unrelated production indexes.
  await Promise.all(models.map(model => model.createIndexes()));
  console.log('MongoDB connected and declared indexes are ready.');
}

module.exports = { connectDatabase };
