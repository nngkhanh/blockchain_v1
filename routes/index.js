const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/authMiddleware');


const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const contractRoutes = require('./contractRoutes');
const userRouters = require('./userRoutes');


const walletController = require('../controllers/walletController');

router.get('/', requireLogin, async (req, res) => {
    try {
        const userName = req.session.user.username;
        const amount = await walletController.fetchWalletData(req.session.user.walletAddress);

        res.render('index', {
            user: req.session.user,
            userName,
            nativeBalance: amount.nativeBalance,
            contractBalance: amount.contractBalance,
            walletAddress: req.session.user.walletAddress
        });
    } catch (err) {
        console.error('Lỗi khi render trang chủ:', err.message);
        res.status(500).render('error', { message: 'Không thể tải dữ liệu ví. Vui lòng thử lại sau.' });
    }
});

router.use('/user', userRouters);
router.use('/wallet', requireLogin, walletRoutes);
router.use('/transaction', requireLogin, transactionRoutes);
router.use('/contract', requireLogin, contractRoutes);

module.exports = router;
    