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
exports.getRegister = (req, res) => {
    res.render('register');
};

// [POST] Xử lý đăng ký
exports.postRegister = (req, res) => {
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

    const encrypted = encrypt(password);

    const wallet = walletController.createWalletFunction();


    users[username] = {
        password: encrypted,
        walletAddress: wallet.address,
        privateKey: wallet.privateKey
    };


    
    saveUsers(users);

    res.redirect('/user/login');
};

// [GET] Trang đăng nhập
exports.getLogin = (req, res) => {
    res.render('login');
};

// [POST] Xử lý đăng nhập
exports.postLogin = (req, res) => {
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
    req.session.user = { username:username ,walletAddress:users[username].walletAddress };
    // localStorage.setItem('username', loggedInUsername);
    // localStorage.setItem('walletAddress', loggedInWalletAddress);
    req.session.isLoggedIn = true;

    // Đăng nhập thành công
    res.redirect('/');
};
