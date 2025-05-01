// walletController.js
const { ethers } = require('ethers');
// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// const contractABI = require('../build/contracts/WalletManager.json').abi;
// const contractAddress = process.env.CONTRACT_ADDRESS;
// const contract = new ethers.Contract(contractAddress, contractABI, provider);

const  { provider, contract, adminWallet } = require('../services/blockchainService');

const createWalletFunction = () => {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
};

const createWallet = (req, res) => {
    const newWallet = createWalletFunction();
    res.render('wallet', { wallet: newWallet });
};

// Hàm để lấy thông tin ví
const fetchWalletData = async (address) => {
    try {
        const contractBalance = await contract.getBalance(address);
        const nativeBalance = await provider.getBalance(address);
        return {
            nativeBalance: ethers.formatEther(nativeBalance),
            contractBalance: ethers.formatEther(contractBalance)
        };
    } catch (error) {
        console.error("Lỗi khi lấy số dư cho địa chỉ:", address, error);
        return null;
    }
};

const getWalletInfo = async (req, res) => {
    const address = req.query.address;
    const walletData = await fetchWalletData(address);

    if (walletData) {
        res.render('wallet-info', {
            address,
            nativeBalance: walletData.nativeBalance,
            contractBalance: walletData.contractBalance
        });
    } else {
        res.render('error', { message: 'Không thể lấy thông tin ví.' });
    }
};

module.exports = {
    createWalletFunction,
    createWallet,
    getWalletInfo,
    fetchWalletData 
};