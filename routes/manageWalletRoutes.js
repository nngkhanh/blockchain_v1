const express = require('express');
const router = express.Router();
const manageWalletController = require('../controllers/manageWalletController');

router.get('/', manageWalletController.getManage_wallet);


module.exports = router;