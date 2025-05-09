const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/authMiddleware');


const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const contractRoutes = require('./contractRoutes');
const userRouters = require('./userRoutes');
const testRouter = require('./testRouter');
const manageWalletRoutes = require('./manageWalletRoutes');
const settingsRouters = require('./settingsRoutes');
const historyRouters = require('./historyRoutes');

router.get('/', (req, res) => {
    res.render('index');
});

router.use('/test', requireLogin, testRouter);
router.use('/user', userRouters);
router.use('/wallet', requireLogin, walletRoutes);
router.use('/transactions', requireLogin, transactionRoutes);
router.use('/contract', requireLogin, contractRoutes);
router.use('/manage-wallet', requireLogin, manageWalletRoutes);
router.use('/settings', requireLogin, settingsRouters);
router.use('/history', requireLogin, historyRouters);


module.exports = router;
