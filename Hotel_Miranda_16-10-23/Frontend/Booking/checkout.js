let selectedPayment = 'MoMo';
let billData = null;

// 1. Khi trang vừa load, lấy dữ liệu Bill từ bộ nhớ tạm
document.addEventListener('DOMContentLoaded', () => {
    billData = JSON.parse(sessionStorage.getItem('bookingReceipt'));
    
    if (!billData) {
        alert("Không tìm thấy dữ liệu hóa đơn!");
        window.location.href = '../index.html';
        return;
    }

    // Đổ dữ liệu vào Bill Detail
    document.getElementById('bill-details').innerHTML = `
        <div class="detail-row"><span>Mã đặt phòng:</span> <strong>${billData.code}</strong></div>
        <div class="detail-row"><span>Tên khách hàng:</span> <strong>${billData.name}</strong></div>
        <div class="detail-row"><span>Số điện thoại:</span> <strong>${billData.phone}</strong></div>
        <div class="detail-row"><span>Phòng đã chọn:</span> <strong>${billData.room}</strong></div>
        <div class="detail-row"><span>Ngày Check-in:</span> <strong>${billData.checkIn}</strong></div>
        <div class="detail-row"><span>Thời gian:</span> <strong>${billData.nights} đêm</strong></div>
        <div class="total-row"><span>TỔNG TIỀN:</span> <span>$${billData.total}</span></div>
    `;
});

// 2. Hàm chọn phương thức thanh toán
function selectMethod(method) {
    selectedPayment = method;
    
    // Đổi CSS cho nút được chọn
    document.getElementById('method-MoMo').classList.remove('active');
    document.getElementById('method-VNPay').classList.remove('active');
    document.getElementById(`method-${method}`).classList.add('active');
}

// 3. Hàm xử lý khi bấm "Thanh toán ngay"
function processPayment() {
    document.getElementById('btnPay').style.display = 'none'; // Ẩn nút thanh toán
    document.getElementById('qr-section').style.display = 'block'; // Hiện khu vực QR
    
    const qrImage = document.getElementById('qr-image');
    const spinner = document.getElementById('loading-spinner');
    const btnComplete = document.getElementById('btn-complete');

    // Giả lập thời gian gọi API MoMo/VNPay (2 giây)
    setTimeout(() => {
        spinner.style.display = 'none';
        
        // Tạo chuỗi data cho QR (Ví dụ: MoMo_HM12345_450USD)
        const qrData = encodeURIComponent(`${selectedPayment}_${billData.code}_Amount_${billData.total}USD`);
        
        // Gọi API tạo QR code miễn phí
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
        qrImage.style.display = 'block';
        
        // Hiện nút "Hoàn tất"
        btnComplete.style.display = 'block';
        
    }, 2000);
}

// 4. Hoàn tất đơn hàng và chuyển sang trang Success
function finishOrder() {
    alert(`Cảm ơn bạn! Thanh toán qua ${selectedPayment} thành công.`);
    // Xóa session nếu cần, hoặc cứ để đó truyền sang trang Success
    window.location.href = 'success.html';
}