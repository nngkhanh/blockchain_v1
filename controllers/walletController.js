const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = require('../build/contracts/WalletManager.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, provider);

const createWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
};

exports.createWallet = (req, res) => {
    const newWallet = createWallet();
    res.render('wallet', { wallet: newWallet });
};

exports.getWalletInfo = async (req, res) => {
    const address = req.query.address;
    try {
        const contractBalance = await contract.getBalance(address);
        const nativeBalance = await provider.getBalance(address);
        res.render('wallet-info', { 
            address: address, 
            nativeBalance: ethers.formatEther(nativeBalance),
            contractBalance: ethers.formatEther(contractBalance)
        });
    } catch (error) {
        console.error("Lỗi khi lấy số dư:", error);
        res.render('error', { message: 'Không thể lấy thông tin ví.' });
    }
};
