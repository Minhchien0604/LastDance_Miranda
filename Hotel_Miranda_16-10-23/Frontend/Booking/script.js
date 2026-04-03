// ================= BIẾN TOÀN CỤC =================
let selectedRoom = null;
let selectedPrice = null;
let selectedRoomType = null;
let checkInDate = "";
let checkOutDate = "";
let numberOfNights = 1;

// ================= 1. KHỞI TẠO NGÀY THÁNG =================
function initDates() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Lấy ngày hôm nay theo múi giờ địa phương
    const today = new Date();
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // Nhận ngày từ URL, nếu không có thì mặc định là hôm nay
    checkInDate = urlParams.get('check_in') || localToday;
    
    // Mặc định ngày đi là ngày mai
    let tmr = new Date(checkInDate);
    tmr.setDate(tmr.getDate() + 1);
    let nextDay = new Date(tmr.getTime() - (tmr.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    checkOutDate = urlParams.get('check_out') || nextDay;

    // Hiển thị ngày tháng lên thanh tìm kiếm
    const searchValues = document.querySelectorAll('.search-value');
    if (searchValues.length >= 2) {
        searchValues[0].textContent = checkInDate;
        searchValues[1].textContent = checkOutDate;
    }

    // Tính số đêm
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    numberOfNights = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
}

// ================= 2. TẢI DANH SÁCH PHÒNG =================
async function fetchAndRenderRooms() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/phong-trong');
        const rooms = await response.json();
        const roomsContainer = document.getElementById('roomsContainer');
        roomsContainer.innerHTML = ''; 

        if (rooms.length === 0) {
            roomsContainer.innerHTML = '<p style="color:red; font-weight:bold;">Xin lỗi, hiện không còn phòng trống cho thời gian này.</p>';
            return;
        }
        
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.innerHTML = `
                <div class="room-image">
                    <img src="${room.HinhAnh}" alt="${room.TenPhong}" onerror="this.src='https://via.placeholder.com/400x300'">
                </div>
                <div class="room-details">
                    <div>
                        <h3>${room.TenPhong}</h3>
                        <p class="room-description">${room.MoTa}</p>
                        <div class="room-features">
                            <div class="room-feature"><span>👤 ${room.SucChua} Guests</span></div>
                            <div class="room-feature"><span>📶 Free WiFi</span></div>
                        </div>
                    </div>
                    <div class="room-footer">
                        <div>
                            <p class="room-price-label">From</p>
                            <p class="room-price">$${room.DonGia} <span class="room-price-suffix">/ night</span></p>
                        </div>
                        <button type="button" class="btn-select-room" onclick="selectRoom('${room.TenPhong}', ${room.DonGia}, '${room.LoaiPhong}')">
                            Select Room
                        </button>
                    </div>
                </div>
            `;
            roomsContainer.appendChild(roomCard);
        });
    } catch (error) {
        console.error("Lỗi tải phòng:", error);
    }
}

// ================= 3. CHỌN PHÒNG =================
function selectRoom(title, price, type) {
    selectedRoom = title;
    selectedPrice = price;
    selectedRoomType = type;
    
    updateBookingSummary();
    
    if (window.innerWidth < 1024) {
        document.getElementById('bookingFormCard').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateBookingSummary() {
    const roomSummary = document.getElementById('roomSummary');
    const submitBtn = document.getElementById('submitBtn');
    
    if (selectedRoom && selectedPrice) {
        const totalPrice = selectedPrice * numberOfNights;
        roomSummary.innerHTML = `
            <div class="room-summary-content">
                <p class="summary-room-label">Selected Room</p>
                <p class="summary-room-name">${selectedRoom}</p>
                <div class="summary-divider">
                    <div class="summary-row">
                        <span>Price per night</span>
                        <span>$${selectedPrice}</span>
                    </div>
                    <div class="summary-row">
                        <span>${numberOfNights} nights</span>
                        <span>$${totalPrice}</span>
                    </div>
                    <div class="summary-total">
                        <span>Total</span>
                        <span class="summary-total-amount">$${totalPrice}</span>
                    </div>
                </div>
            </div>
        `;
        submitBtn.disabled = false;
    } else {
        roomSummary.innerHTML = '<p class="no-room-selected">Please select a room to continue</p>';
        submitBtn.disabled = true;
    }
}

// ================= 4. GỬI ĐƠN ĐẶT PHÒNG =================
// ================= 4. GỬI ĐƠN ĐẶT PHÒNG (Đã diệt tận gốc lỗi reload) =================
window.thucHienDatPhong = async function() {
    if (!selectedRoom || !selectedPrice) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    // Tự kiểm tra xem khách đã nhập đủ chưa (vì không dùng thẻ Form nữa)
    if (!fullName || !email || !phone) {
        alert("Vui lòng điền đầy đủ Tên, Email và Số điện thoại!");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';
    
    const bookingData = {
        name: fullName,
        email: email,
        phone: phone,
        check_in: checkInDate,
        check_out: checkOutDate,
        room_type: selectedRoomType
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
            // Đổ dữ liệu vào Modal thành công
            const totalAmount = selectedPrice * numberOfNights;
            document.getElementById('confirmationCode').textContent = result.booking_id; 
            document.getElementById('modalName').textContent = fullName;
            document.getElementById('modalEmail').textContent = email;
            document.getElementById('modalPhone').textContent = phone;
            document.getElementById('modalRoom').textContent = selectedRoom;
            document.getElementById('modalPricePerNight').textContent = '$' + selectedPrice;
            document.getElementById('modalSubtotal').textContent = '$' + totalAmount;
            document.getElementById('modalTotal').textContent = '$' + totalAmount;
            
            // Hiện Modal! Lần này nó không thể tắt được nữa
            document.getElementById('confirmationModal').classList.add('active');
        } else {
            alert("Lỗi đặt phòng: " + result.message);
        }
    } catch (error) {
        alert("Không thể kết nối Server!");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm Booking';
    }
};

// ================= 5. ĐÓNG MODAL =================
// Hàm xử lý đóng Modal, reset form và tải lại danh sách phòng
window.closeModal = function() {
    document.getElementById('confirmationModal').classList.remove('active');
    document.getElementById('bookingForm').reset();
    selectedRoom = null;
    selectedPrice = null;
    updateBookingSummary();
    fetchAndRenderRooms(); // Tải lại phòng để phòng vừa đặt biến mất
}

// Bắt sự kiện cho nút (X) trên đầu Modal
const closeBtnIcon = document.getElementById('modalClose');
if(closeBtnIcon) {
    closeBtnIcon.addEventListener('click', closeModal);
}

// ================= 6. KHỞI CHẠY =================
document.addEventListener('DOMContentLoaded', function() {
    initDates();
    fetchAndRenderRooms();
});