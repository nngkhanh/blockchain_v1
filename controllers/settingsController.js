const settingsController = require('../controllers/settingsController');

exports.getSettings = (req, res) => {
    try {
        res.render('settings');
    } catch (err) {
        console.error('Lỗi khi render trang chủ:', err.message);
        res.status(500).render('error', { message: 'Không thể tải dữ liệu ví. Vui lòng thử lại sau.' });
    }
};