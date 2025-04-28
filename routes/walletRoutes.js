const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/create', walletController.createWallet);
router.get('/', walletController.getWalletInfo);

module.exports = router;
