const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.post('/deposit', contractController.deposit);
router.post('/withdraw', contractController.withdraw);

module.exports = router;
