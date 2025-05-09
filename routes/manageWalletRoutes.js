const express = require('express');
const router = express.Router();
const manageWalletController = require('../controllers/manageWalletController');

router.post('/create-wallet', manageWalletController.postCreateWallet);
router.get('/', manageWalletController.getManage_wallet);



module.exports = router;