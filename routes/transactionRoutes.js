const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/send', transactionController.sendTransaction);
router.get('/', transactionController.getTransaction);


module.exports = router;
