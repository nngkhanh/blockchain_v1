require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const { ethers } = require("ethers");
const helmet = require('helmet');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    partialsDir: [
        __dirname + '/views/partials',
    ]
}));
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));



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



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




// Địa chỉ của Smart Contract đã triển khai (cập nhật sau khi migrate)
const contractAddress = process.env.CONTRACT_ADDRESS;
// ABI của Smart Contract (lấy từ file build/contracts/WalletManager.json)
const contractABI = require('./build/contracts/WalletManager.json').abi;
// Kết nối đến provider (Ganache)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Khởi tạo contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Hàm để tạo ví mới
const createWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
};

// Routes
app.get('/', (req, res) => {
    res.render('index');
});
app.use('/', routes);

// Middleware xử lý lỗi tổng quát
app.use((err, req, res, next) => {
    console.error('Lỗi toàn cục:', err.stack);
    res.status(500).render('error', { message: 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.' });
});


app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});