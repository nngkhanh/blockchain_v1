const { ethers } = require('ethers');
const { provider, contract, adminWallet } = require('../services/blockchainService');

// Hàm tiện ích để format lỗi
const formatError = (error) => {
    if (error.reason) return error.reason;
    if (error.message.includes('insufficient funds')) return 'Số dư ví không đủ.';
    if (error.message.includes('nonce')) return 'Lỗi nonce, vui lòng kiểm tra lại giao dịch.';
    return 'Lỗi không xác định, vui lòng thử lại.';
};

// Tạo ví mới
const createWalletFunction = () => {
    try {
        const wallet = ethers.Wallet.createRandom();
        return {
            address: wallet.address,
            privateKey: wallet.privateKey
        };
    } catch (error) {
        console.error("Lỗi khi tạo ví:", error);
        throw new Error("Không thể tạo ví mới.");
    }
};

// Controller để tạo ví
const createWallet = (req, res) => {
    try {
        const newWallet = createWalletFunction();
        // Cảnh báo: Không nên hiển thị privateKey trong giao diện thực tế
        res.status(200).render('wallet', { wallet: newWallet });
    } catch (error) {
        console.error("Lỗi trong createWallet:", error);
        res.status(500).render('error', { message: formatError(error) });
    }
};

// Hàm để lấy thông tin ví
const fetchWalletData = async (address) => {
    // Kiểm tra địa chỉ hợp lệ
    if (!ethers.isAddress(address)) {
        throw new Error("Địa chỉ không hợp lệ.");
    }

    try {
        // Lấy số dư từ contract và native balance
        const [contractBalance, nativeBalance] = await Promise.all([
            contract.getBalance(address),
            provider.getBalance(address)
        ]);

        return {
            nativeBalance: ethers.formatEther(nativeBalance),
            contractBalance: ethers.formatEther(contractBalance)
        };
    } catch (error) {
        console.error("Lỗi khi lấy số dư cho địa chỉ:", address, error);
        throw new Error(formatError(error));
    }
};

// Controller để lấy thông tin ví
const getWalletInfo = async (req, res) => {
    const { address } = req.query;

    // Kiểm tra đầu vào
    if (!address || !ethers.isAddress(address)) {
        return res.status(400).render('error', { message: "Vui lòng cung cấp địa chỉ hợp lệ." });
    }

    try {
        const walletData = await fetchWalletData(address);
        res.status(200).render('wallet-info', {
            address,
            nativeBalance: walletData.nativeBalance,
            contractBalance: walletData.contractBalance
        });
    } catch (error) {
        console.error("Lỗi trong getWalletInfo:", error);
        res.status(500).render('error', { message: error.message || "Không thể lấy thông tin ví." });
    }
};

module.exports = {
    createWalletFunction,
    createWallet,
    getWalletInfo,
    fetchWalletData
};