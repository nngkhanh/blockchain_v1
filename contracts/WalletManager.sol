// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletManager {
    mapping(address => uint256) public balances;

    address public admin;
    uint256 public transferFeeRate = 1; // 1%
    uint256 public totalFeesCollected;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event FeeCollected(address indexed from, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function transferTo(address recipient, uint256 amount) public {
        require(amount > 0, "Transfer amount must be greater than 0");
        require(msg.sender != recipient, "Can't transfer to yourself");

        uint256 fee = (amount * transferFeeRate) / 100;
        uint256 netAmount = amount - fee;

        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[recipient] += netAmount;
        balances[admin] += fee;

        totalFeesCollected += fee;
        emit FeeCollected(msg.sender, fee);
        emit Transfer(msg.sender, recipient, netAmount);
    }

    function getBalance(address _address) public view returns (uint256) {
        return balances[_address];
    }

    function withdrawFees() external {
        require(msg.sender == admin, "Only admin can withdraw fees");
        payable(admin).transfer(address(this).balance);
    }
}
