const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/authMiddleware');


const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const contractRoutes = require('./contractRoutes');
const userRouters = require('./userRoutes');
const testRouter = require('./testRouter');

const walletController = require('../controllers/walletController');

router.get('/', (req, res) => {
    res.render('index');
});

router.use('/test', requireLogin, testRouter);
router.use('/user', userRouters);
router.use('/wallet', requireLogin, walletRoutes);
router.use('/transaction', requireLogin, transactionRoutes);
router.use('/contract', requireLogin, contractRoutes);

module.exports = router;
    