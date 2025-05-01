const { ethers } = require('ethers');

const pk = "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";
const wallet = new ethers.Wallet(pk);

console.log("Địa chỉ ví là:", wallet.address);
