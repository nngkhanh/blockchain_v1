đây là hướng dẫn cài đặt dự án cho linux fedora cấu hình dự án blockchain

sudo dnf install nodejs npm

node -v
npm -v

sudo npm install --save-dev truffle@5.11.5 (nếu dùng window npm install --save-dev truffle@5.11.5)

truffle version

sudo npm install --save-dev ganache@7.9.2 (nếu dùng window npm install --save-dev ganache@7.9.2)

ganache --version

sudo npm install --save-dev solc@0.8.29 (nếu dùng window npm install --save-dev solc@0.8.29)

solc --version

mkdir blockchain-wallet-app
cd blockchain-wallet-app
npm init -y

npm install express body-parser handlebars web3 ethers

mkdir contracts
cd contracts

Tạo file WalletManager.sol bên trong thư mục contracts vừa tạo với nội dung bên trong là:

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



dòng này là quay lại thư mục root của dự án 
cd .. 


truffle init

sau khi tạo xong file trufile-config.js thì dán nội dung này vào: (xóa dữ liệu hết rồi dán)

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


thực hiện biên dịch sao khi dán nội dung
truffle compile


Tạo file migration trong thư mục migrations (ví dụ: 1_deploy_wallet_manager.js): 
với nội dung sau:
/****************
const WalletManager = artifacts.require("WalletManager");

module.exports = function (deployer) {
  deployer.deploy(WalletManager);
};
***************/


Chạy Ganache trong một terminal riêng để run  các địa chỉ ví và ETH ảo  (không dùng ganache-cli nữa vì là bản cũ và không được hỗ trợ cho node 18 20 nữa)
ganache

Triển khai contract lên mạng Ganache: 
truffle migrate


## bỏ qua đoạn này dùng đoạn bên dưới
đảm bảo 3 lệnh được chạy khi trước khi run project
1. ganache  (mỗi khi ganache run lại thì phải cập nhật smart contrac lại bằng lệnh truffle migrate)
2. truffle migrate (dùng để lấy contract address cho server => dùng trong file server tại const contractAddress ="" )  
3. node server.js hoặc npm run dev (cấu hình trong package.json)
4. vui lòng chuyển đến branh của mình để chỉnh => giảm xung đột và mất dữ liệu 
    => git checkout Duy/Khanh (xem file knowledge_git.md để biết cách làm)


## dùng đoạn này
cập nhật lệnh run project version 2 (đối với project lần đầu run)
1. truffle compile (cần gọi lại khi code solidity thay đổi)
2. npm run ganache 
3. truffle migrate (cập nhật address vào file .env)
4. npm run dev

## hoặc dùng đoạn này
nếu project đã run trước đó thì dùng lệnh sau:
1. npm run ganache 
2. npm run dev


## lưu ý: để lưu lại lịch sử cũng như các địa chỉ ví đã tạo bới ganache trước khi tắt 
-> "npm run ganache:start": "ganache --database.dbPath ./ganache-data --mnemonic 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'",

## sau khi run lại xong thì ký lại hợp đồng
    "migrate": "truffle migrate --network development",

## thực hiện biên dịch sao khi cập nhật nội dung cho file sol trong thư mục contract
truffle compile