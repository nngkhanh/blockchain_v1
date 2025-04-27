const WalletManager = artifacts.require("WalletManager");

module.exports = function (deployer) {
  deployer.deploy(WalletManager);
};