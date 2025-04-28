const express = require('express');
const router = express.Router();

const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const contractRoutes = require('./contractRoutes');

// Các route được mount vào router cha
router.use('/wallet', walletRoutes);
router.use('/transaction', transactionRoutes);
router.use('/contract', contractRoutes);

module.exports = router;
    