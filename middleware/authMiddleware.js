function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        next(); // Nếu đã đăng nhập thì cho đi tiếp
    } else {
        res.redirect('/user/login'); // Chưa đăng nhập thì chuyển về trang login
    }
    // console.log(req.session.cookie.expires);

}

module.exports = { requireLogin };
