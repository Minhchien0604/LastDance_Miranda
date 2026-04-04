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

    const today = new Date();
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    checkInDate = urlParams.get('check_in') || localToday;

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


// ================= 4. GỬI ĐƠN ĐẶT PHÒNG  =================
window.thucHienDatPhong = async function () {
    console.log("--- Executing Booking (Direct Success Version) ---");

    // 1. Kiểm tra đầu vào
    if (!selectedRoom || !selectedPrice) {
        alert("Please select a room first!");
        return;
    }

    const nameVal = document.getElementById('fullName').value;
    const emailVal = document.getElementById('email').value;
    const phoneVal = document.getElementById('phone').value;

    if (!nameVal || !emailVal || !phoneVal) {
        alert("Please fill in all information!");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';

    const bookingData = {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
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
            const totalAmount = selectedPrice * numberOfNights;
            
            // 2. Gói dữ liệu vào SessionStorage để trang Success hiển thị
            const bookingReceipt = {
                code: result.booking_id || 'HM' + Date.now(),
                name: nameVal,
                room: selectedRoom,
                checkIn: checkInDate,
                nights: numberOfNights,
                total: totalAmount
            };
            sessionStorage.setItem('bookingReceipt', JSON.stringify(bookingReceipt));

            // 3. BAY THẲNG SANG TRANG SUCCESS
            console.log("Booking successful! Redirecting...");
            window.location.href = 'success.html';
            
        } else {
            alert("Error: " + (result.message || "Cannot complete booking"));
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Confirm Booking';
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Server connection failed!");
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm Booking';
    }
};
// ================= 5. ĐÓNG MODAL =================
window.closeModal = function () {
    document.getElementById('confirmationModal').classList.remove('active');
    
    // Reset form nhưng phải giữ lại Tên và Email nếu đã đăng nhập
    document.getElementById('bookingForm').reset();
    checkLoginAndLockForm(); // Gọi lại hàm khóa form để điền lại Tên/Email
    
    selectedRoom = null;
    selectedPrice = null;
    updateBookingSummary();
    fetchAndRenderRooms(); 
}

const closeBtnIcon = document.getElementById('modalClose');
if (closeBtnIcon) {
    closeBtnIcon.addEventListener('click', closeModal);
}

// ================= 6. KIỂM TRA ĐĂNG NHẬP VÀ KHÓA FORM =================
function checkLoginAndLockForm() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const submitBtn = document.getElementById('submitBtn');
    const nameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');

    if (!currentUser) {
        // TRƯỜNG HỢP CHƯA ĐĂNG NHẬP: Khóa nút bấm
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Please Login to Book';
            submitBtn.style.backgroundColor = '#94a3b8'; // Đổi màu xám báo hiệu bị khóa
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.title = "Bạn cần đăng nhập để đặt phòng";
        }
    } else {
        // TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP: Điền sẵn dữ liệu và khóa ô nhập liệu
        if (nameEl) {
            nameEl.value = currentUser.ten_kh;
            nameEl.setAttribute('readonly', true);
            nameEl.style.backgroundColor = '#e2e8f0'; // Đổi màu nền xám nhẹ để biết là bị khóa
        }
        if (emailEl) {
            emailEl.value = currentUser.email;
            emailEl.setAttribute('readonly', true);
            emailEl.style.backgroundColor = '#e2e8f0';
        }
        
        // Trả lại trạng thái bình thường cho nút bấm
        if (submitBtn) {
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Confirm Booking
            `;
            submitBtn.style.backgroundColor = ''; 
            submitBtn.style.cursor = 'pointer';
            submitBtn.title = "";
            // Nút vẫn bị disabled ở đây, nó sẽ được gỡ disabled khi chọn phòng (ở hàm updateBookingSummary)
        }
    }
}

// ================= 7. KHỞI CHẠY =================
// ================= 7. KHỞI CHẠY =================
document.addEventListener('DOMContentLoaded', function () {
    initDates();
    fetchAndRenderRooms();
    checkLoginAndLockForm();

    // --- ĐỔI GIAO DIỆN LOGIN/AVATAR TRÊN NAVBAR ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authSection = document.getElementById('auth-section');

    if (currentUser && authSection) {
        const userAvatar = currentUser.picture || '../assets/default-avatar.png'; 
        
        authSection.innerHTML = `
            <div class="user-profile-container" style="display: flex; align-items: center; gap: 10px;">
                <div class="avatar-wrapper" style="width: 35px; height: 35px; border-radius: 50%; overflow: hidden; border: 2px solid #f6ac0f;">
                    <img src="${userAvatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <button onclick="handleLogout()" style="background: none; border: none; cursor: pointer; color: #ef4444;" title="Logout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
    }
});

// --- Cập nhật hàm initDates một chút để đổ dữ liệu vào ô input khi vừa vào trang ---
function initDates() {
    const urlParams = new URLSearchParams(window.location.search);
    const today = new Date();
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // Lấy ngày từ URL (nếu có)
    checkInDate = urlParams.get('check_in') || localToday;
    
    let tmr = new Date(checkInDate);
    tmr.setDate(tmr.getDate() + 1);
    let nextDay = new Date(tmr.getTime() - (tmr.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    checkOutDate = urlParams.get('check_out') || nextDay;

    // Đổ giá trị vào 2 ô input modify
    const inInput = document.getElementById('modify_check_in');
    const outInput = document.getElementById('modify_check_out');
    
    if (inInput && outInput) {
        inInput.value = checkInDate;
        outInput.value = checkOutDate;
        inInput.min = localToday; // Không cho đặt phòng ngày hôm qua
    }

    // Tính số đêm ban đầu
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    numberOfNights = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
}

// --- HÀM XỬ LÝ KHI BẤM NÚT MODIFY SEARCH ---
window.handleModifySearch = function() {
    const newIn = document.getElementById('modify_check_in').value;
    const newOut = document.getElementById('modify_check_out').value;

    if (!newIn || !newOut) {
        alert("Please select both dates!");
        return;
    }

    if (newIn >= newOut) {
        alert("Check-out date must be after Check-in date!");
        return;
    }

    // 1. Cập nhật lại các biến toàn cục để khi đặt phòng nó gửi đúng ngày mới
    checkInDate = newIn;
    checkOutDate = newOut;
    
    // 2. Tính toán lại số đêm
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    numberOfNights = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
    
    console.log(`Updated Search: ${checkInDate} to ${checkOutDate} (${numberOfNights} nights)`);
    
    // 3. Tải lại danh sách phòng (để lọc lại theo ngày mới nếu backend hỗ trợ)
    fetchAndRenderRooms();
    
    // 4. Quan trọng: Reset lại phòng đang chọn để tránh nhầm lẫn giá
    selectedRoom = null;
    selectedPrice = null;
    updateBookingSummary();
    
    alert("Search details updated!");
};
// Thêm hàm logout nếu chưa có trong file script.js này
window.completePayment = function() {
    alert("Thanh toán thành công! Hệ thống đang xuất hóa đơn...");
    window.location.href = 'success.html';
}