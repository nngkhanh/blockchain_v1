const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/create', walletController.createWallet);
router.get('/info', walletController.getWalletInfo);

module.exports = router;
