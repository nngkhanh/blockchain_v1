const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

// Đăng xuất
router.get('/logout', userController.logout);

// GET/POST: Đổi mật khẩu
router.get('/settings', (req, res) => {
    if (!req.session.user) return res.redirect('/user/login');
    res.render('settings', { error: null, success: null });
});
router.post('/change-password', userController.postChangePassword);

module.exports = router;