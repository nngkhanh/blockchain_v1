Ganache: là một blockchain cục bộ (local blockchain) mô phỏng Ethereum

cách mà một block đầu tiên được tạo ra là run server ganache (command: ganache)

quy trình mà một block mới được ghi vào
    = thu thập giao dịch: giao dịch gửi từ nodejs (bằng etherjs) đến mạng ganache
    = ganache thu thập các dữ liệu mới vào một khối 
    = liên kết khối: khối mới thêm vào chuổi bằng cách tính hash của khối hiện tại và liên kết với khối trước đó  

quy trình lấy ra một block
    = dùng thư viện Ethers.js để tương tác với blockchain.
    = 



triển khai smart constract thế nào?
    + viết code sol để cấu hình cho smart contract
    + dùng truffle để biên dịch thành bytecode và ABI (Application Binary Interface , tạo file ABI và bytecode)
    + sau khi biên dịch ta được contractABI một file json 

contractABI là gì?
    + đóng vai trò như "giao diện chuẩn" để ứng dụng bên ngoài tương tác với smart contract trên blockchain
    + ứng dụng web cần ABI để giải mã các lệnh gọi đến smart contract (thông qua etherJS)
    




phí gas: là chi phí tính toán giãi mã cho block, muốn nhanh hay chậm phụ thuộc vào số wei người dùng trả, trả nhiều thì được ưu tiên giải mã trước