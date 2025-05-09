const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('../helper/cryptoHelper');
const walletController = require('./walletController');
const usersFile = path.join(__dirname, '../database/users.json');

// Load users
function loadUsers() {
    if (!fs.existsSync(usersFile)) return {};

    const data = fs.readFileSync(usersFile, 'utf8').trim();
    if (!data) return {}; // File rỗng

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('⚠️ users.json lỗi: ', error.message);
        return {}; // fallback tránh crash
    }
}

// Save users
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// [GET] Trang đăng ký
function getRegister(req, res) {
    res.render('register');
}

// [POST] Xử lý đăng ký
function postRegister(req, res) {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.render('register', { error: 'Vui lòng điền đầy đủ thông tin.' });
    }

    if (password !== confirmPassword) {
        return res.render('register', { error: 'Mật khẩu xác nhận không khớp.' });
    }

    const users = loadUsers();
    if (users[username]) {
        return res.render('register', { error: 'Tên đăng nhập đã tồn tại.' });
    }

    const encrypted = encrypt(password); // Mã hóa password
    const wallet = walletController.createWalletFunction(); // Tạo ví khi người dùng đăng ký

    // Tạo object người dùng với mảng wallets
    users[username] = {
        password: encrypted,
        wallets: [
            {
                address: wallet.address,
                privateKey: wallet.privateKey, // Lưu private key trực tiếp (không mã hóa)
                createdAt: new Date().toLocaleDateString('vi-VN')
            }
        ]
    };

    saveUsers(users);
    res.redirect('/user/login');
}

// [GET] Trang đăng nhập
function getLogin(req, res) {
    res.render('login');
}

// [POST] Xử lý đăng nhập
function postLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { error: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    const users = loadUsers();
    if (!users[username]) {
        return res.render('login', { error: 'Tài khoản không tồn tại.' });
    }

    const encryptedPassword = users[username].password;
    const decrypted = decrypt(encryptedPassword);

    if (decrypted !== password) {
        return res.render('login', { error: 'Mật khẩu không đúng.' });
    }

    // Lưu thông tin người dùng vào session
    req.session.user = {
        username: username,
        walletAddress: users[username].wallets[0]?.address // Lấy địa chỉ ví đầu tiên
    };
    req.session.isLoggedIn = true;

    // Đăng nhập thành công
    res.redirect('/');
}

module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    loadUsers,
    saveUsers // Thêm saveUsers để sử dụng trong các controller khác
};