const settingsController = require('../controllers/historyController');

exports.getHistory = (req, res) => {
    try {
        res.render('history');
    } catch (err) {
        console.error('Lỗi khi render trang chủ:', err.message);
        res.status(500).render('error', { message: 'Không thể tải dữ liệu ví. Vui lòng thử lại sau.' });
    }
};
