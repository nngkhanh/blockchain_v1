const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const { saveUsers, loadUsers } = require('./userController');
const { provider, contract, adminWallet } = require('../services/blockchainService');


exports.getManage_wallet = async (req, res) => {
    try {
        const username = req.session.user?.username;
        if (!username) {
            return res.redirect('/user/login');
        }

        const dataPath = path.join(__dirname, '../database/users.json');
        const rawData = fs.readFileSync(dataPath, 'utf8').trim();
        const users = JSON.parse(rawData);

        if (!users[username]) {
            return res.status(404).render('error', { message: 'Không tìm thấy ví cho người dùng.' });
        }

        // Tính số dư cho từng ví
        const wallets = await Promise.all(
            (users[username].wallets || []).map(async (wallet) => {
                const balance = await provider.getBalance(wallet.address);
                return {
                    ...wallet,
                    balance: ethers.formatEther(balance) // Chuyển sang ETH
                };
            })
        );

        // Render template với dữ liệu
        res.render('manage-wallet', {
            wallets,
            successMessage: req.session.successMessage
        });

        // Xóa thông báo sau khi hiển thị
        req.session.successMessage = null;
    } catch (err) {
        console.error('Lỗi khi render trang ví:', err.message);
        res.status(500).render('error', { message: 'Không thể tải ví. Vui lòng thử lại sau.' });
    }
};

exports.postCreateWallet = async (req, res) => {
    try {
        const username = req.session.user?.username;

        // Kiểm tra đăng nhập
        if (!username) {
            return res.status(401).render('error', { message: 'Chưa đăng nhập.' });
        }

        const users = loadUsers();

        // Kiểm tra người dùng tồn tại
        if (!users[username]) {
            return res.status(404).render('error', { message: 'Người dùng không tồn tại.' });
        }

        // Tạo ví mới sử dụng EtherJS
        const wallet = ethers.Wallet.createRandom();
        const walletData = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            createdAt: new Date().toLocaleDateString('vi-VN') // Định dạng ngày/tháng/năm tiếng Việt
        };

        // Khởi tạo mảng ví nếu chưa có
        if (!Array.isArray(users[username].wallets)) {
            users[username].wallets = [];
        }

        // Thêm ví mới
        users[username].wallets.push(walletData);

        // Ghi lại dữ liệu
        saveUsers(users); // Hàm đồng bộ

        // Lưu thông báo thành công vào session
        req.session.successMessage = `Ví mới đã được tạo: ${walletData.address}`;

        // Điều hướng về trang quản lý ví (GET /manage-wallet sẽ dùng successMessage)
        res.redirect('/manage-wallet');

    } catch (err) {
        console.error('Lỗi khi tạo ví:', err.message);
        res.status(500).render('error', { message: 'Không thể tạo ví mới. Vui lòng thử lại sau.' });
    }
};
