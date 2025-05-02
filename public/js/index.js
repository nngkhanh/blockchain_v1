
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


//------------------------------------------------------------
//------------------------------------------------------------

const amountContract = document.getElementById('amountContract');
const feeContract = document.getElementById('feeContract');
const total_amount_contract = document.getElementById('total_amount_contract');

console.log(amountContract);
console.log(feeContract);
console.log(total_amount_contract);

function updateValues() {
  const valueAmount = parseFloat(amountContract.value) || 0;
  const defaultPercentageFee = 1; // 1%

  // Tính toán phí
  const fee = (valueAmount * defaultPercentageFee) / 100;

  // Tính toán tổng giá trị
  const totalAmount = fee + valueAmount;


  feeContract.value = fee;


  // Cập nhật tổng giá trị
  total_amount_contract.value = totalAmount;
}

// Gọi updateValues ban đầu để thiết lập giá trị ban đầu
updateValues();

// Thêm event listener cho sự kiện 'input' trên amountContract
amountContract.addEventListener('input', updateValues);

// Thêm event listener cho sự kiện 'input' trên feeContract để cập nhật total khi người dùng thay đổi trực tiếp
feeContract.addEventListener('input', () => {
  const valueAmount = parseFloat(amountContract.value) || 0;
  const percentageFee = parseFloat(feeContract.value) || 0;
  const fee = (valueAmount * percentageFee) / 100;
  const totalAmount = fee + valueAmount;
  total_amount_contract.value = totalAmount;
});