
const sessionUserName = document.getElementById('data-username');
const sessionWalletAddress = document.getElementById('data-walletaddress');
const session_UserName = sessionUserName.dataset.username;
const session_WalletAddress = sessionWalletAddress.dataset.walletaddress;
console.log("session_UserName:", session_UserName);
console.log("session_WalletAddress:", session_WalletAddress);


const nativeBalance = "{{nativeBalance}}";
const contractBalance = "{{contractBalance}}";


if (session_UserName && session_WalletAddress) {
    localStorage.setItem('username', session_UserName);
    localStorage.setItem('walletAddress', session_WalletAddress);
    localStorage.setItem('isLoggedIn', 'true');
    console.log("Đã lưu thông tin đăng nhập vào localStorage:", session_UserName);
}