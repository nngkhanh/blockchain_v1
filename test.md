Chào bạn, mình rất vui được hỗ trợ bạn xây dựng ứng dụng web blockchain quản lý ví điện tử sử dụng Node.js, Handlebars, Solidity trên Linux Fedora. Đây là một dự án khá phức tạp, nên chúng ta sẽ đi từng bước một cách chi tiết.

Mục tiêu tổng quan:

Xây dựng một ứng dụng web cho phép người dùng:

    Tạo và quản lý ví điện tử (địa chỉ public và private key).
    Xem số dư của ví.
    Thực hiện giao dịch (gửi tiền).
    Xem lịch sử giao dịch.
    Tương tác với một Smart Contract được triển khai trên blockchain.

Các bước thực hiện:

    Cài đặt các công cụ cần thiết trên Fedora:
        Node.js và npm:
        Bash

sudo dnf install nodejs npm

Kiểm tra cài đặt:
Bash

node -v
npm -v

Truffle: Một framework phát triển Solidity, testing và deployment dễ dàng.
Bash

sudo npm install -g truffle

Kiểm tra cài đặt:
Bash

truffle version

Ganache CLI: Một blockchain cá nhân để phát triển và thử nghiệm.
Bash

sudo npm install -g ganache-cli

Kiểm tra cài đặt:
Bash

ganache-cli --version

Solidity Compiler (solc): Truffle thường quản lý việc này, nhưng bạn có thể cài đặt riêng nếu cần.
Bash

sudo npm install -g solc

Kiểm tra cài đặt:
Bash

    solc --version

Khởi tạo dự án:
Bash

mkdir blockchain-wallet-app
cd blockchain-wallet-app
npm init -y

Cài đặt các thư viện Node.js cần thiết:
Bash

npm install express body-parser handlebars web3 ethers

    express: Framework web cho Node.js.
    body-parser: Middleware để xử lý dữ liệu gửi từ form.
    handlebars: Template engine để tạo giao diện người dùng động.
    web3: Thư viện JavaScript để tương tác với blockchain Ethereum.
    ethers: Một thư viện JavaScript thay thế cho Web3.js, cung cấp nhiều tính năng và dễ sử dụng hơn trong một số trường hợp. Chúng ta sẽ sử dụng ethers trong ví dụ này.

Cấu hình Smart Contract (Solidity):

    Tạo thư mục contracts:
    Bash

mkdir contracts
cd contracts

Tạo file WalletManager.sol:
Solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletManager {
    mapping(address => uint256) public balances;
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance(address _address) public view returns (uint256) {
        return balances[_address];
    }
}

Quay lại thư mục gốc của dự án:
Bash

    cd ..

Cấu hình Truffle:
Bash

truffle init

Thao tác này sẽ tạo các thư mục contracts, migrations, test và file cấu hình truffle-config.js.

Cấu hình mạng trong truffle-config.js:
Mở file truffle-config.js và cấu hình để kết nối với Ganache CLI. Ví dụ:
JavaScript

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network ID
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",    // Điều chỉnh phiên bản Solidity
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  }
};

Biên dịch và triển khai Smart Contract:

    Biên dịch contract:
    Bash

truffle compile

Tạo file migration trong thư mục migrations (ví dụ: 1_deploy_wallet_manager.js):
JavaScript

const WalletManager = artifacts.require("WalletManager");

module.exports = function (deployer) {
  deployer.deploy(WalletManager);
};

Chạy Ganache CLI trong một terminal riêng:
Bash

ganache-cli

Triển khai contract lên mạng Ganache:
Bash

    truffle migrate

    Sau khi triển khai thành công, bạn sẽ thấy địa chỉ của contract.

Xây dựng backend (Node.js và Express):

    Tạo file server.js trong thư mục gốc của dự án:
    JavaScript

    const express = require('express');
    const bodyParser = require('body-parser');
    const { engine } = require('express-handlebars');
    const { ethers } = require('ethers');

    const app = express();
    const port = 3000;

    // Cấu hình Handlebars
    app.engine('handlebars', engine());
    app.set('view engine', 'handlebars');
    app.set('views', './views');

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Địa chỉ của Smart Contract đã triển khai (cập nhật sau khi migrate)
    const contractAddress = 'YOUR_CONTRACT_ADDRESS';
    // ABI của Smart Contract (lấy từ file build/contracts/WalletManager.json)
    const contractABI = require('./build/contracts/WalletManager.json').abi;
    // Kết nối đến provider (Ganache)
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
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

    Lưu ý: Thay thế YOUR_CONTRACT_ADDRESS bằng địa chỉ contract sau khi bạn đã migrate thành công.

Xây dựng giao diện người dùng (Handlebars):

    Tạo thư mục views trong thư mục gốc của dự án.
    Tạo các file .handlebars sau:
        index.handlebars: Trang chủ với các liên kết.
        HTML

<!DOCTYPE html>
<html>
<head>
    <title>Ứng dụng Quản lý Ví Blockchain</title>
</head>
<body>
    <h1>Chào mừng đến với Ứng dụng Quản lý Ví Blockchain</h1>
    <ul>
        <li><a href="/wallet/create">Tạo ví mới</a></li>
        <li><form action="/wallet/{{wallet.address}}" method="get"><input type="text" name="address" placeholder="Nhập địa chỉ ví"><button type="submit">Xem thông tin ví</button></form></li>
        <li><h2>Gửi giao dịch</h2>
            <form action="/transaction/send" method="post">
                <input type="text" name="senderPrivateKey" placeholder="Private Key người gửi">
                <input type="text" name="recipientAddress" placeholder="Địa chỉ người nhận">
                <input type="number" step="any" name="amount" placeholder="Số lượng ETH">
                <button type="submit">Gửi</button>
            </form>
        </li>
        <li><h2>Gửi tiền vào Contract</h2>
            <form action="/contract/deposit" method="post">
                <input type="text" name="privateKey" placeholder="Private Key của bạn">
                <input type="number" step="any" name="amount" placeholder="Số lượng ETH">
                <button type="submit">Gửi</button>
            </form>
        </li>
        <li><h2>Rút tiền từ Contract</h2>
            <form action="/contract/withdraw" method="post">
                <input type="text" name="privateKey" placeholder="Private Key của bạn">
                <input type="number" step="any" name="amount" placeholder="Số lượng ETH">
                <button type="submit">Rút</button>
            </form>
        </li>
    </ul>
</body>
</html>

wallet.handlebars: Hiển thị thông tin ví mới tạo.
HTML

<!DOCTYPE html>
<html>
<head>
    <title>Ví mới</title>
</head>
<body>
    <h1>Ví mới của bạn</h1>
    <p><strong>Địa chỉ:</strong> {{wallet.address}}</p>
    <p><strong>Private Key:</strong> {{wallet.privateKey}} (Hãy giữ bí mật private key này!)</p>
    <p><a href="/">Quay lại trang chủ</a></p>
</body>
</html>

wallet-info.handlebars: Hiển thị thông tin ví (số dư).
HTML

<!DOCTYPE html>
<html>
<head>
    <title>Thông tin ví</title>
</head>
<body>
    <h1>Thông tin ví</h1>
    <p><strong>Địa chỉ:</strong> {{address}}</p>
    <p><strong>Số dư:</strong> {{balance}} ETH</p>
    <p><a href="/">Quay lại trang chủ</a></p>
</body>
</html>

transaction-success.handlebars: Hiển thị thông báo giao dịch thành công.
HTML

<!DOCTYPE html>
<html>
<head>
    <title>Giao dịch thành công</title>
</head>
<body>
    <h1>Giao dịch thành công</h1>
    <p><strong>Hash giao dịch:</strong> {{txHash}}</p>
    <p><a href="/">Quay lại trang chủ</a></p>
</body>
</html>

deposit-success.handlebars: Hiển thị thông báo gửi tiền thành công.
HTML

<!DOCTYPE html>
<html>
<head>
    <title>Gửi tiền thành công</title>
</head>
<body>
    <h1>Gửi tiền thành công</h1>
    <p><strong>Hash giao dịch:</strong> {{txHash}}</p>
    <p><a href="/">Quay lại trang chủ</a></p>
</body>
</html>

withdraw-success.handlebars: Hiển thị thông báo rút tiền thành công.
HTML

<!DOCTYPE html>
<html>
<head>
    <title>Rút tiền thành công</title>
</head>
<body>
    <h1>Rút tiền thành công</h1>
    <p><strong>Hash giao dịch:</strong> {{txHash}}</p>
    <p><a href="/">Quay lại trang chủ</a></p>
</body>
</html>

error.handlebars: Hiển thị thông báo lỗi.
HTML

        <!DOCTYPE html>
        <html>
        <head>
            <title>Lỗi</title>
        </head>
        <body>
            <h1>Lỗi</h1>
            <p>{{message}}</p>
            <p><a href="/">Quay lại trang chủ</a></p>
        </body>
        </html>

Chạy ứng dụng:

    Đảm bảo Ganache CLI vẫn đang chạy.
    Trong terminal của dự án, chạy lệnh:
    Bash

        node server.js

        Mở trình duyệt và truy cập http://localhost:3000.

Các bước tiếp theo và nâng cao:

    Quản lý nhiều ví: Lưu trữ thông tin ví của người dùng một cách an toàn (ví dụ: sử dụng database và mã hóa private key).
    Lịch sử giao dịch: Tương tác với các sự kiện (events) của Smart Contract để hiển thị lịch sử giao dịch.
    Bảo mật:
        Không bao giờ hiển thị private key cho người dùng cuối một cách trực tiếp trừ khi thực sự cần thiết và có cảnh báo rõ ràng.
        Bảo vệ private key của người dùng một cách cẩn thận (mã hóa, lưu trữ an toàn).
        Kiểm tra và xác thực dữ liệu đầu vào từ người dùng.
    Giao diện người dùng đẹp hơn: Sử dụng CSS và JavaScript để cải thiện giao diện và trải nghiệm người dùng.
    Testing: Viết unit test cho Smart Contract và các chức năng backend.
    Triển khai lên mạng thử nghiệm hoặc mạng chính: Cấu hình Truffle để kết nối với các mạng khác.

Lưu ý quan trọng về bảo mật:

    Tuyệt đối không lưu trữ private key của người dùng trên frontend (trình duyệt).
    Việc quản lý private key là cực kỳ nhạy cảm. Trong ứng dụng thực tế, bạn cần có các biện pháp bảo mật mạnh mẽ để bảo vệ khóa của người dùng. Các giải pháp thường dùng bao gồm ví phần cứng, ví phần mềm có mã hóa, hoặc các giải pháp custodial (người dùng tin tưởng bên thứ ba quản lý khóa