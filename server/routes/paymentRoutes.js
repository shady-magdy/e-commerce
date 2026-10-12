'use strict';

const express = require('express');
const router = express.Router();
router.all('*', (req, res) => res.status(501).json({ error: 'Payments are not implemented yet.' }));
module.exports = router;
