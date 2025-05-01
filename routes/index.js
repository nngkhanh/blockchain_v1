const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/authMiddleware');


const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const contractRoutes = require('./contractRoutes');
const userRouters = require('./userRoutes');


const walletController = require('../controllers/walletController');

router.get('/', requireLogin, async (req, res) => {
    let userName = await req.session.user.username;
    let amount = await walletController.fetchWalletData(req.session.user.walletAddress);
    
    res.render('index', { user: req.session.user, userName, nativeBalance:amount.nativeBalance , contractBalance: amount.contractBalance, walletAddress:req.session.user.walletAddress});
});
router.use('/user', userRouters);
router.use('/wallet', requireLogin, walletRoutes);
router.use('/transaction', requireLogin, transactionRoutes);
router.use('/contract', requireLogin, contractRoutes);

module.exports = router;
    