const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
// const { ethers } = require('ethers');
const ethers  = require('ethers');
const { JsonRpcProvider } = require('ethers');

const app = express();
const port = 3000;

// Cấu hình Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    partialsDir: [
        // path to your partials
        __dirname + '/views/partials',
    ]
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Địa chỉ của Smart Contract đã triển khai (cập nhật sau khi migrate)
const contractAddress = '0xFD8695304cE99F7b2FefcF68DB00d7CD1f612936';
// ABI của Smart Contract (lấy từ file build/contracts/WalletManager.json)
const contractABI = require('./build/contracts/WalletManager.json').abi;
// Kết nối đến provider (Ganache)
const provider = new JsonRpcProvider('http://12.0.0.1:8545');
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

app.get('/wallet/create', (req, res) => {
    const newWallet = createWallet();
    res.render('wallet', { wallet: newWallet });
});

app.get('/wallet/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const balance = await contract.getBalance(address);
        res.render('wallet-info', { address: address, balance: ethers.utils.formatEther(balance) });
    } catch (error) {
        console.error("Lỗi khi lấy số dư:", error);
        res.render('error', { message: 'Không thể lấy thông tin ví.' });
    }
});

app.post('/transaction/send', async (req, res) => {
    const { senderPrivateKey, recipientAddress, amount } = req.body;
    const wallet = new ethers.Wallet(senderPrivateKey, provider);
    const signer = wallet.connect(provider);
    const amountToSend = ethers.utils.parseEther(amount);

    try {
        const tx = await signer.sendTransaction({
            to: recipientAddress,
            value: amountToSend
        });
        await tx.wait(); // Chờ giao dịch được xác nhận
        res.render('transaction-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi gửi giao dịch:", error);
        res.render('error', { message: 'Lỗi khi thực hiện giao dịch.' });
    }
});

app.post('/contract/deposit', async (req, res) => {
    const { privateKey, amount } = req.body;
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const amountToSend = ethers.utils.parseEther(amount);
    const contractWithSigner = contract.connect(signer);

    try {
        const tx = await contractWithSigner.deposit({ value: amountToSend });
        await tx.wait();
        res.render('deposit-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi gửi tiền vào contract:", error);
        res.render('error', { message: 'Lỗi khi gửi tiền vào contract.' });
    }
});

app.post('/contract/withdraw', async (req, res) => {
    const { privateKey, amount } = req.body;
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const amountToWithdraw = ethers.utils.parseEther(amount);
    const contractWithSigner = contract.connect(signer);

    try {
        const tx = await contractWithSigner.withdraw(amountToWithdraw);
        await tx.wait();
        res.render('withdraw-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi rút tiền từ contract:", error);
        res.render('error', { message: 'Lỗi khi rút tiền từ contract.' });
    }
});

app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});