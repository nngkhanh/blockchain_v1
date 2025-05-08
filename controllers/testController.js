
const walletController = require('../controllers/walletController');


exports.getTest = async (req, res) => {
    try {
           const userName = req.session.user.username;
           const amount = await walletController.fetchWalletData(req.session.user.walletAddress);
   
           res.render('test', {
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
};
