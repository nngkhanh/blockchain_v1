const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const walletController = require('../controllers/walletController');


exports.sendTransaction = async (req, res) => {
    const { senderPrivateKey, recipientAddress, amount } = req.body;
    if (!ethers.isAddress(recipientAddress)) {
        return res.render('error', { message: 'Địa chỉ người nhận không hợp lệ.' });
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.render('error', { message: 'Số tiền gửi không hợp lệ.' });
    }
    const wallet = new ethers.Wallet(senderPrivateKey, provider);
    const signer = wallet.connect(provider);
    const amountToSend = ethers.parseEther(amount);

    try {
        const tx = await signer.sendTransaction({
            to: recipientAddress,
            value: amountToSend
        });
        await tx.wait();
        res.render('transaction-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi gửi giao dịch:", error);
        res.render('error', { message: 'Lỗi khi thực hiện giao dịch.' });
    }
};



exports.getTransaction = async (req, res) => {
    try {
        try {
            const userName = req.session.user.username;
            const amount = await walletController.fetchWalletData(req.session.user.walletAddress);

            res.render('transactions', {
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
    } catch (error) {
        console.error("Lỗi khi hiển thị trang giao dịch:", error);
        res.status(500).render('error', { message: 'Đã xảy ra lỗi khi cố gắng hiển thị trang giao dịch.' });
    }
};



