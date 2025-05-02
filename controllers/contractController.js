require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = require('../build/contracts/WalletManager.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error("Địa chỉ contract không hợp lệ hoặc không được cung cấp.");
}
const contract = new ethers.Contract(contractAddress, contractABI, provider);

exports.deposit = async (req, res) => {
    const { privateKey, amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.render('error', { message: "Số tiền nạp không hợp lệ." });
    }

    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const signer = wallet.connect(provider);
        const contractWithSigner = contract.connect(signer);
        const amountToSend = ethers.parseEther(amount);

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

    // Kiểm tra đầu vào
    if (!privateKey || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.render('error', { message: "Vui lòng nhập số tiền hợp lệ và private key." });
    }

    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const signer = wallet.connect(provider);
        const contractWithSigner = contract.connect(signer);
        const amountToWithdraw = ethers.parseEther(amount);
        const address = wallet.address;

        // Kiểm tra địa chỉ contract hợp lệ
        if (!contract.address || !ethers.isAddress(contract.address)) {
            return res.render('error', { message: "Địa chỉ contract không hợp lệ." });
        }

        // Lấy số dư trong contract (balance nội bộ)
        const userBalanceInContract = await contract.getBalance(address);
        if (userBalanceInContract.lt(amountToWithdraw)) {
            return res.render('error', { message: "Số dư của bạn trong contract không đủ." });
        }

        // Lấy số dư thực của contract (external ETH)
        const realContractBalance = await provider.getBalance(contract.address);
        if (realContractBalance.lt(amountToWithdraw)) {
            return res.render('error', { message: "Contract không đủ ETH để trả." });
        }

        // Thực hiện rút tiền
        const tx = await contractWithSigner.withdraw(amountToWithdraw);
        await tx.wait();
        res.render('withdraw-success', { txHash: tx.hash });

    } catch (error) {
        console.error("Lỗi khi rút tiền từ contract:", error);
        res.render('error', { message: 'Lỗi khi rút tiền từ contract.' });
    }
};
    




exports.transfer = async (req, res) => {
    const { privateKey, recipient, total_amount } = req.body;

    if (!ethers.isAddress(recipient)) {
        return res.render('error', { message: 'Địa chỉ người nhận không hợp lệ.' });
    }

    console.log("total_amount từ request:", total_amount);

    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const contractWithSigner = contract.connect(signer);
    const total_amountToSend = ethers.parseEther(total_amount);
    console.log('total_amountToSend (BigNumber): ', total_amountToSend.toString());
    console.log('Địa chỉ người gửi (từ privateKey):', wallet.address);
    console.log('Địa chỉ người nhận:', recipient);
    console.log('Địa chỉ contract:', contract.address); // Thêm log địa chỉ contract

    const senderBalance = await contract.getBalance(wallet.address);
    console.log('Số dư của người gửi trong contract:', senderBalance.toString());

    // Thử lấy số dư của contract (nếu có hàm)
    try {
        const contractBalance = await contract.getBalance(contract.address); // Nếu là Ether
        console.log('Số dư của contract (Ether):', ethers.formatEther(contractBalance.toString()));
    } catch (error) {
        console.log('Không thể lấy số dư Ether của contract hoặc không phải là Ether contract.');
    }

    try {
        const tx = await contractWithSigner.transferTo(recipient, total_amountToSend);
        console.log('Transaction Hash:', tx.hash);
        await tx.wait();
        res.render('success', { txHash: tx.hash });
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

        // Truy vấn event liên quan
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

        // Duyệt và bổ sung thông tin chi tiết
        for (const { type, event } of allEvents) {
            const tx = await provider.getTransaction(event.transactionHash);
            const receipt = await provider.getTransactionReceipt(event.transactionHash);
            const block = await provider.getBlock(event.blockNumber);

            const gasUsed = receipt.gasUsed;
            const gasPrice = tx.gasPrice;
            const gasFee = ethers.formatEther(gasUsed * gasPrice);

            history.push({
                type,
                from: event.args.from || event.args.sender || address,
                to: event.args.to || event.args.recipient || address,
                amount: ethers.formatEther(event.args.amount),
                hash: event.transactionHash,
                blockNumber: event.blockNumber,
                timestamp: block.timestamp,
                gasFee
            });
        }

        // Sắp xếp theo block mới nhất trước
        history.sort((a, b) => b.blockNumber - a.blockNumber);

        res.render('history', { address, history });
    } catch (err) {
        console.error("Lỗi khi lấy lịch sử giao dịch:", err);
        res.render('error', { message: 'Không thể lấy lịch sử giao dịch.' });
    }
};

