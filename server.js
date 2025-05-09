require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const { ethers } = require("ethers");
const helmet = require('helmet');
const moment = require('moment');
const session = require('express-session');
const routes = require('./routes');

const { provider, contract, adminWallet } = require('./services/blockchainService');

const app = express();
const port = process.env.PORT || 3000;


// xem số lượng gas price còn lại 
async function checkGasPrice() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Ganache mặc định
    const feeData = await provider.getFeeData();
    console.log("Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"));
    console.log("Max Fee Per Gas:", ethers.formatUnits(feeData.maxFeePerGas, "gwei"));
    console.log("Max Priority Fee Per Gas:", ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei"));


} checkGasPrice();


// In ra địa chỉ ví admin để kiểm tra
console.log('Admin address:', adminWallet.address);

// Cấu hình Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    // Xóa noEscape để tăng bảo mật, chỉ bật khi cần
    helpers: {
        // Helper để serialize JSON
        json: (context) => JSON.stringify(context),
        // Các helper so sánh
        eq: (a, b) => a === b,
        ne: (a, b) => a !== b,
        lt: (a, b) => a < b,
        gt: (a, b) => a > b,
        lte: (a, b) => a <= b,
        gte: (a, b) => a >= b,
        // Format ngày giờ từ chuỗi timestamp
        formatDate: (timestamp) => {
            try {
                // Nếu timestamp là chuỗi (đã format từ Node.js)
                if (typeof timestamp === 'string') {
                    return moment(timestamp, 'MM/DD/YYYY, HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                }
                // Nếu timestamp là Unix timestamp (số giây)
                return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
            } catch (error) {
                console.error('Lỗi formatDate:', error);
                return timestamp; // Trả về nguyên gốc nếu lỗi
            }
        },
        // Rút gọn hash giao dịch
        truncateHash: (hash) => {
            if (typeof hash !== 'string') return hash;
            return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
        },
        // Rút gọn địa chỉ Ethereum
        truncateAddress: (address) => {
            if (typeof address !== 'string') return address;
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        },
        // Format số ETH với số thập phân cố định
        formatEther: (value) => {
            if (!value) return '0';
            return Number(value).toFixed(4);
        }
    },
    partialsDir: [
        path.join(__dirname, '/views/partials'),
    ]
}));

app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình bảo mật Helmet
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "http://127.0.0.1:3000"],
                connectSrc: ["'self'"],
            },
        },
    })
);

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cấu hình session
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default_session_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60, // 1 giờ
            httpOnly: true,
            secure: false, // Đặt true nếu sử dụng HTTPS
            sameSite: 'lax',
        },
    })
);


// Middleware để xác định trạng thái đăng nhập
app.use((req, res, next) => {
    // Kiểm tra xem có session userId hay không (có thể thay thế bằng JWT hoặc cách khác)
    res.locals.isLoggedIn = req.session && req.session.isLoggedIn ? true : false;
    res.locals.user= req.session && req.session.user ? req.session.user : null;
    next();
});

// Routes
app.use('/', routes);

// Middleware xử lý lỗi tổng quát
app.use((err, req, res, next) => {
    console.error('Lỗi toàn cục:', err.stack);
    res.status(500).render('error', { message: 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.' });
});

app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại http://127.0.0.1:${port}`);
});
