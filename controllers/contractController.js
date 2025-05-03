require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = require('../build/contracts/WalletManager.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

// Kiểm tra hợp lệ contract address
if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error("Địa chỉ contract không hợp lệ hoặc không được cung cấp.");
}

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Hàm tiện ích để format lỗi
const formatError = (error) => {
    if (error.reason) return error.reason;
    if (error.message.includes('insufficient funds')) return 'Số dư ví không đủ để trả phí gas.';
    if (error.message.includes('nonce')) return 'Lỗi nonce, vui lòng kiểm tra lại giao dịch.';
    return 'Lỗi không xác định, vui lòng thử lại.';
};

exports.deposit = async (req, res) => {
    const { privateKey, amount } = req.body;

    // Kiểm tra đầu vào
    if (!privateKey || !ethers.isHexString(privateKey, 32)) {
        return res.status(400).render('error', { message: "Private key không hợp lệ." });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).render('error', { message: "Số tiền nạp phải là số dương." });
    }

    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const signer = wallet.connect(provider);
        const contractWithSigner = contract.connect(signer);
        const amountToSend = ethers.parseEther(amount);

        // Kiểm tra số dư ví
        const balance = await provider.getBalance(wallet.address);
        if (balance < amountToSend) {
            return res.status(400).render('error', { message: "Số dư ví không đủ để nạp." });
        }

        // Gửi giao dịch
        const tx = await contractWithSigner.deposit({
            value: amountToSend,
            gasLimit: 200000 // Thêm giới hạn gas mặc định
        });
        const receipt = await tx.wait();

        return res.status(200).render('deposit-success', {
            txHash: tx.hash,
            amount: amount,
            from: wallet.address,
            gasUsed: receipt.gasUsed.toString()
        });
    } catch (error) {
        console.error("Lỗi khi nạp tiền:", error);
        return res.status(500).render('error', { message: formatError(error) });
    }
};

exports.withdraw = async (req, res) => {
    const { privateKey, amount } = req.body;

    // Kiểm tra đầu vào
    if (!privateKey || !ethers.isHexString(privateKey, 32)) {
        return res.status(400).render('error', { message: "Private key không hợp lệ." });
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).render('error', { message: "Số tiền rút phải là số dương." });
    }

    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const signer = wallet.connect(provider);
        const contractWithSigner = contract.connect(signer);
        const amountToWithdraw = ethers.parseEther(amount);
        const address = wallet.address;

        // Kiểm tra số dư trong contract
        const userBalanceInContract = await contract.getBalance(address);
        if (userBalanceInContract.lt(amountToWithdraw)) {
            return res.status(400).render('error', {
                message: `Số dư trong contract không đủ. Hiện có: ${ethers.formatEther(userBalanceInContract)} ETH`
            });
        }

        // Kiểm tra số dư thực của contract
        const realContractBalance = await provider.getBalance(contract.address);
        if (realContractBalance < amountToWithdraw) {
            return res.status(400).render('error', {
                message: `Contract không đủ ETH. Số dư contract: ${ethers.formatEther(realContractBalance)} ETH`
            });
        }

        // Thực hiện rút tiền
        const tx = await contractWithSigner.withdraw(amountToWithdraw, {
            gasLimit: 200000
        });
        const receipt = await tx.wait();

        return res.status(200).render('withdraw-success', {
            txHash: tx.hash,
            amount: amount,
            from: address,
            gasUsed: receipt.gasUsed.toString()
        });
    } catch (error) {
        console.error("Lỗi khi rút tiền:", error);
        return res.status(500).render('error', { message: formatError(error) });
    }
};

exports.transfer = async (req, res) => {
    const { privateKey, recipient, total_amount } = req.body;

    // Kiểm tra đầu vào
    if (!privateKey || !ethers.isHexString(privateKey, 32)) {
        return res.status(400).render('error', { message: "Private key không hợp lệ." });
    }
    if (!ethers.isAddress(recipient)) {
        return res.status(400).render('error', { message: "Địa chỉ người nhận không hợp lệ." });
    }
    if (!total_amount || isNaN(total_amount) || parseFloat(total_amount) <= 0) {
        return res.status(400).render('error', { message: "Số tiền chuyển phải là số dương." });
    }

    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const signer = wallet.connect(provider);
        const contractWithSigner = contract.connect(signer);
        const amountToSend = ethers.parseEther(total_amount);

        // Kiểm tra số dư người gửi
        const senderBalance = await contract.getBalance(wallet.address);
        if (senderBalance < amountToSend) {
            return res.status(400).render('error', {
                message: `Số dư không đủ. Hiện có: ${ethers.formatEther(senderBalance)} ETH`
            });
        }

        // Thực hiện chuyển tiền
        const tx = await contractWithSigner.transferTo(recipient, amountToSend, {
            gasLimit: 200000
        });
        const receipt = await tx.wait();

        return res.status(200).render('success', {
            txHash: tx.hash,
            amount: total_amount,
            from: wallet.address,
            to: recipient,
            gasUsed: receipt.gasUsed.toString()
        });
    } catch (error) {
        console.error("Lỗi khi chuyển tiền:", error);
        return res.status(500).render('error', { message: formatError(error) });
    }
};

exports.getTransactionHistory = async (req, res) => {
    const { address } = req.query;

    // Kiểm tra địa chỉ
    if (!ethers.isAddress(address)) {
        return res.status(400).render('error', { message: "Địa chỉ không hợp lệ." });
    }

    try {
        const history = [];
        const lowerAddress = address.toLowerCase();

        // Truy vấn các sự kiện
        const depositEvents = await contract.queryFilter(contract.filters.Deposit(lowerAddress));
        const withdrawalEvents = await contract.queryFilter(contract.filters.Withdrawal(lowerAddress));
        const sentTransferEvents = await contract.queryFilter(contract.filters.Transfer(lowerAddress, null));
        const receivedTransferEvents = await contract.queryFilter(contract.filters.Transfer(null, lowerAddress));

        const allEvents = [
            ...depositEvents.map(e => ({ type: 'Deposit', event: e })),
            ...withdrawalEvents.map(e => ({ type: 'Withdraw', event: e })),
            ...sentTransferEvents.map(e => ({ type: 'Sent', event: e })),
            ...receivedTransferEvents.map(e => ({ type: 'Received', event: e })),
        ];

        // Xử lý chi tiết giao dịch
        for (const { type, event } of allEvents) {
            const tx = await provider.getTransaction(event.transactionHash);
            const receipt = await provider.getTransactionReceipt(event.transactionHash);
            const block = await provider.getBlock(event.blockNumber);

            const gasUsed = receipt.gasUsed;
            const gasPrice = tx.gasPrice || receipt.effectiveGasPrice;
            const gasFee = ethers.formatEther(gasUsed * gasPrice);

            history.push({
                type,
                from: event.args.from || event.args.sender || address,
                to: event.args.to || event.args.recipient || address,
                amount: ethers.formatEther(event.args.amount),
                hash: event.transactionHash,
                blockNumber: event.blockNumber,
                timestamp: new Date(block.timestamp * 1000).toLocaleString(),
                gasFee,
                status: receipt.status === 1 ? 'Thành công' : 'Thất bại'
            });
        }

        // Sắp xếp theo thời gian giảm dần
        history.sort((a, b) => b.blockNumber - a.blockNumber);

        return res.status(200).render('history', {
            address,
            history,
            totalTransactions: history.length
        });
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử giao dịch:", error);
        return res.status(500).render('error', { message: "Không thể lấy lịch sử giao dịch." });
    }
};