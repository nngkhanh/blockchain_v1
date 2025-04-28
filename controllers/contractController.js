const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = require('../build/contracts/WalletManager.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, provider);

exports.deposit = async (req, res) => {
    const { privateKey, amount } = req.body;
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const contractWithSigner = contract.connect(signer);
    const amountToSend = ethers.parseEther(amount);

    try {
        const tx = await contractWithSigner.deposit({ value: amountToSend });
        await tx.wait();
        res.render('deposit-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi gửi tiền vào contract:", error);
        res.render('error', { message: 'Lỗi khi gửi tiền vào contract.' });
    }
};

exports.withdraw = async (req, res) => {
    const { privateKey, amount } = req.body;
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const contractWithSigner = contract.connect(signer);
    const amountToWithdraw = ethers.parseEther(amount);

    try {
        const tx = await contractWithSigner.withdraw(amountToWithdraw);
        await tx.wait();
        res.render('withdraw-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi rút tiền từ contract:", error);
        res.render('error', { message: 'Lỗi khi rút tiền từ contract.' });
    }
};
