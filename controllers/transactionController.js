const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

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
