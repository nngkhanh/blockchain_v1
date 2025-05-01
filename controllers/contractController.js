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



exports.transfer = async (req, res) => {
    const { privateKey, recipient, amount } = req.body;

    if (!ethers.isAddress(recipient)) {
        return res.render('error', { message: 'Địa chỉ người nhận không hợp lệ.' });
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const contractWithSigner = contract.connect(signer);
    const amountToSend = ethers.parseEther(amount);

    try {
        const tx = await contractWithSigner.transferTo(recipient, amountToSend);
        await tx.wait();
        res.render('transfer-success', { txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi chuyển tiền qua contract:", error);
        res.render('error', { message: 'Không thể chuyển tiền.' });
    }
};


exports.getTransactionHistory = async (req, res) => {
    const { address } = req.query;
    if (!ethers.isAddress(address)) {
        return res.render('error', { message: 'Địa chỉ không hợp lệ.' });
    }

    try {
        const history = [];

        const lowerAddress = address.toLowerCase();

        const depositEvents = await contract.queryFilter(contract.filters.Deposit(lowerAddress));
        const withdrawalEvents = await contract.queryFilter(contract.filters.Withdrawal(lowerAddress));
        const sentTransferEvents = await contract.queryFilter(contract.filters.Transfer(lowerAddress, null));
        const receivedTransferEvents = await contract.queryFilter(contract.filters.Transfer(null, lowerAddress));

        depositEvents.forEach(event => {
            history.push({
                type: 'Deposit',
                from: event.args.sender,
                to: address,
                amount: ethers.formatEther(event.args.amount),
                txHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        withdrawalEvents.forEach(event => {
            history.push({
                type: 'Withdraw',
                from: address,
                to: event.args.recipient,
                amount: ethers.formatEther(event.args.amount),
                txHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        sentTransferEvents.forEach(event => {
            history.push({
                type: 'Sent',
                from: event.args.from,
                to: event.args.to,
                amount: ethers.formatEther(event.args.amount),
                txHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        receivedTransferEvents.forEach(event => {
            history.push({
                type: 'Received',
                from: event.args.from,
                to: event.args.to,
                amount: ethers.formatEther(event.args.amount),
                txHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        history.sort((a, b) => b.blockNumber - a.blockNumber); // Mới nhất trước

        res.render('history', { address, history });
    } catch (err) {
        console.error("Lỗi khi lấy lịch sử giao dịch:", err);
        res.render('error', { message: 'Không thể lấy lịch sử giao dịch.' });
    }
};
