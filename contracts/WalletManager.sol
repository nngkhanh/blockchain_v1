// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletManager {
    mapping(address => uint256) public balances;
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance(address _address) public view returns (uint256) {
        return balances[_address];
    }
}