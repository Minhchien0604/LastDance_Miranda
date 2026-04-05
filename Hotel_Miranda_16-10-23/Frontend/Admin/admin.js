// ===================================================================
// ADMIN DASHBOARD - Complete Implementation
// ===================================================================
const API_URL = 'http://127.0.0.1:5000/api';
let currentEditingId = null;
let currentEditingType = null;
let currentActiveTab = 'dashboard';

// ===================================================================
// Check Admin Authentication
// ===================================================================
function checkAdminAuth() {
    const isAdmin = localStorage.getItem('isAdmin');
    const adminData = localStorage.getItem('adminData');

    if (!isAdmin || !adminData) {
        alert('Bạn cần đăng nhập bằng tài khoản Admin!');
        window.location.href = '../Login/index.html';
        return false;
    }
    return true;
}

// ===================================================================
// Initialize on DOM Load
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) {
        return;
    }

    const adminData = JSON.parse(localStorage.getItem('adminData'));
    document.getElementById('adminName').textContent = adminData?.ten_kh || 'Admin';

    setupNavigation();
    setupButtonListeners();
    setupModalListeners();
    setupFormListeners();
    setupReportListeners();
    loadDashboard();
});

// ===================================================================
// Navigation Setup
// ===================================================================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.classList.contains('logout')) {
                e.preventDefault();
                handleLogout();
                return;
            }
            
            e.preventDefault();
            const tabName = item.getAttribute('data-tab');
            
            if (!tabName) return;
            
            // Save current tab
            currentActiveTab = tabName;
            
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Show selected tab
            const selectedTab = document.getElementById(tabName);
            if (selectedTab) {
                selectedTab.classList.add('active');
                item.classList.add('active');
                
                // Load data based on tab
                switch(tabName) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'booking':
                        loadBookings();
                        break;
                    case 'phong':
                        loadPhongs();
                        break;
                    case 'nhanvien':
                        loadNhanViens();
                        break;
                    case 'dichvu':
                        loadDichVus();
                        break;
                    case 'baocao':
                        // Report content loads on button click
                        break;
                    case 'settings':
                        // Settings content is static
                        break;
                }
            }
            
            // Close sidebar on mobile
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    });
}

// ===================================================================
// Button Listeners Setup
// ===================================================================
function setupButtonListeners() {
    // Add Booking Button
    const bookingBtn = document.getElementById('addNewBookingBtn');
    if (bookingBtn) {
        bookingBtn.addEventListener('click', () => {
            currentEditingId = null;
            document.getElementById('bookingForm').reset();
            loadRoomsToSelect();
            document.getElementById('bookingModal').classList.add('show');
        });
    }

    // Add Room Button
    const phongBtn = document.getElementById('addPhongBtn');
    if (phongBtn) {
        phongBtn.addEventListener('click', () => {
            currentEditingId = null;
            currentEditingType = 'phong';
            document.getElementById('phongForm').reset();
            document.getElementById('phongModalTitle').textContent = 'Thêm phòng';
            document.getElementById('maPhong').disabled = false;
            document.getElementById('phongModal').classList.add('show');
        });
    }

    // Add Staff Button
    const nhanvienBtn = document.getElementById('addNhanVienBtn');
    if (nhanvienBtn) {
        nhanvienBtn.addEventListener('click', () => {
            currentEditingId = null;
            currentEditingType = 'nhanvien';
            document.getElementById('nhanvienForm').reset();
            document.getElementById('nhanvienModalTitle').textContent = 'Thêm nhân viên';
            document.getElementById('nhanvienModal').classList.add('show');
        });
    }

    // Add Service Button
    const dichvuBtn = document.getElementById('addDichVuBtn');
    if (dichvuBtn) {
        dichvuBtn.addEventListener('click', () => {
            currentEditingId = null;
            currentEditingType = 'dichvu';
            document.getElementById('dichvuForm').reset();
            document.getElementById('dichvuModalTitle').textContent = 'Thêm dịch vụ';
            document.getElementById('dichvuModal').classList.add('show');
        });
    }

    // Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }
}

// ===================================================================
// Modal Listeners Setup
// ===================================================================
function setupModalListeners() {
    // Close all modals when clicking close button
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                resetModalForm(modal);
            }
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                resetModalForm(modal);
            }
        });
    });

    // Close modal with cancel/hủy button
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                resetModalForm(modal);
            }
        });
    });
}

// Helper function to reset modal form
function resetModalForm(modal) {
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
    
    // Reset image preview for phongModal
    if (modal.id === 'phongModal') {
        document.getElementById('imagePreviewGroup').style.display = 'none';
        document.getElementById('hinhAnhPhong').value = '';
        document.getElementById('maPhong').disabled = false;
        currentEditingId = null;
        document.getElementById('phongModalTitle').textContent = 'Thêm phòng';
    }
    
    // Reset for other modals
    if (modal.id === 'nhanvienModal') {
        currentEditingId = null;
        document.getElementById('nhanvienModalTitle').textContent = 'Thêm nhân viên';
    }
    
    if (modal.id === 'dichvuModal') {
        currentEditingId = null;
        document.getElementById('dichvuModalTitle').textContent = 'Thêm dịch vụ';
    }
    
    // Restore current active tab (but not for static tabs)
    if (currentActiveTab && currentActiveTab !== 'baocao' && currentActiveTab !== 'settings') {
        const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
        if (tabNav) {
            tabNav.click();
        }
    }
}

function setupFormListeners() {
    // ===== PHÒNG FORM =====
    const phongForm = document.getElementById('phongForm');
    if (phongForm) {
        phongForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Use FormData to support file uploads
            const formData = new FormData();
            formData.append('ma_phong', document.getElementById('maPhong').value);
            formData.append('ten_phong', document.getElementById('tenPhong').value);
            formData.append('loai_phong', document.getElementById('loaiPhong').value);
            formData.append('don_gia', parseFloat(document.getElementById('donGia').value));
            formData.append('suc_chua', parseInt(document.getElementById('sucChua').value));
            formData.append('mo_ta', document.getElementById('moTa').value);
            
            // Handle file upload
            const fileInput = document.getElementById('hinhAnhPhong');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }

            try {
                if (currentEditingId) {
                    // UPDATE
                    const response = await fetch(`${API_URL}/admin/phong/${currentEditingId}`, {
                        method: 'PUT',
                        body: formData
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('✓ Cập nhật phòng thành công!');
                        document.getElementById('phongModal').classList.remove('show');
                        loadPhongs();
                        // Restore active tab after a micro delay
                        setTimeout(() => {
                            const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                            if (tabNav && !tabNav.classList.contains('active')) {
                                tabNav.click();
                            }
                        }, 100);
                    } else {
                        alert('❌ ' + data.message);
                    }
                } else {
                    // CREATE
                    const response = await fetch(`${API_URL}/admin/phong`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('✓ Tạo phòng thành công!');
                        document.getElementById('phongModal').classList.remove('show');
                        phongForm.reset();
                        loadPhongs();
                        // Restore active tab after a micro delay
                        setTimeout(() => {
                            const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                            if (tabNav && !tabNav.classList.contains('active')) {
                                tabNav.click();
                            }
                        }, 100);
                    } else {
                        alert('❌ ' + data.message);
                    }
                }
            } catch (error) {
                alert('❌ Lỗi: ' + error.message);
            }
        });
        
        // Image preview handler
        const fileInput = document.getElementById('hinhAnhPhong');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const preview = document.getElementById('hinhAnhPreview');
                        const previewGroup = document.getElementById('imagePreviewGroup');
                        preview.src = event.target.result;
                        previewGroup.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    document.getElementById('imagePreviewGroup').style.display = 'none';
                }
            });
        }
    }

    // ===== NHÂN VIÊN FORM =====
    const nhanvienForm = document.getElementById('nhanvienForm');
    if (nhanvienForm) {
        nhanvienForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                ten_nv: document.getElementById('tenNV').value,
                chuc_vu: document.getElementById('chucVu').value,
                email: document.getElementById('emailNV').value,
                sdt: document.getElementById('sdtNV').value,
                luong: parseFloat(document.getElementById('luongNV').value),
                vai_tro: document.getElementById('chucVu').value,
                mat_khau: '123456'
            };

            try {
                if (currentEditingId) {
                    // UPDATE
                    const response = await fetch(`${API_URL}/admin/nhanvien/${currentEditingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('✓ Cập nhật nhân viên thành công!');
                        document.getElementById('nhanvienModal').classList.remove('show');
                        loadNhanViens();
                        // Restore active tab after a micro delay
                        setTimeout(() => {
                            const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                            if (tabNav && !tabNav.classList.contains('active')) {
                                tabNav.click();
                            }
                        }, 100);
                    } else {
                        alert('❌ ' + data.message);
                    }
                } else {
                    // CREATE
                    const response = await fetch(`${API_URL}/admin/nhanvien`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('✓ Tạo nhân viên thành công!');
                        document.getElementById('nhanvienModal').classList.remove('show');
                        nhanvienForm.reset();
                        loadNhanViens();
                        // Restore active tab after a micro delay
                        setTimeout(() => {
                            const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                            if (tabNav && !tabNav.classList.contains('active')) {
                                tabNav.click();
                            }
                        }, 100);
                    } else {
                        alert('❌ ' + data.message);
                    }
                }
            } catch (error) {
                alert('❌ Lỗi: ' + error.message);
            }
        });
    }

    // ===== DỊCH VỤ FORM =====
    const dichvuForm = document.getElementById('dichvuForm');
    if (dichvuForm) {
        dichvuForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                ten_dich_vu: document.getElementById('tenDichVu').value,
                don_gia: parseFloat(document.getElementById('donGiaDichVu').value)
            };

            try {
                if (currentEditingId) {
                    // UPDATE
                    const response = await fetch(`${API_URL}/admin/dichvu/${currentEditingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('✓ Cập nhật dịch vụ thành công!');
                        document.getElementById('dichvuModal').classList.remove('show');
                        loadDichVus();
                        // Restore active tab after a micro delay
                        setTimeout(() => {
                            const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                            if (tabNav && !tabNav.classList.contains('active')) {
                                tabNav.click();
                            }
                        }, 100);
                    } else {
                        alert('❌ ' + data.message);
                    }
                } else {
                    // CREATE
                    const response = await fetch(`${API_URL}/admin/dichvu`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('✓ Tạo dịch vụ thành công!');
                        document.getElementById('dichvuModal').classList.remove('show');
                        dichvuForm.reset();
                        loadDichVus();
                        // Restore active tab after a micro delay
                        setTimeout(() => {
                            const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                            if (tabNav && !tabNav.classList.contains('active')) {
                                tabNav.click();
                            }
                        }, 100);
                    } else {
                        alert('❌ ' + data.message);
                    }
                }
            } catch (error) {
                alert('❌ Lỗi: ' + error.message);
            }
        });
    }

    // ===== BOOKING FORM =====
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveBooking();
        });
    }
}

// ===================================================================
// Load Dashboard Statistics
// ===================================================================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/admin/dashboard-stats`);
        const stats = await response.json();

        document.getElementById('totalRooms').textContent = stats.total_rooms;
        document.getElementById('emptyRooms').textContent = stats.empty_rooms;
        document.getElementById('bookedRooms').textContent = stats.booked_rooms;
        document.getElementById('revenue').textContent = formatCurrency(stats.total_revenue);
        document.getElementById('totalCustomers').textContent = stats.total_customers;
        document.getElementById('totalStaff').textContent = stats.total_staff;

        console.log('✓ Dashboard loaded');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
    }
}

// ===================================================================
// Load Bookings
// ===================================================================
async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/admin/bookings`);
        const bookings = await response.json();

        const tbody = document.getElementById('bookingTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #999;">Không có dữ liệu</td></tr>';
            return;
        }

        bookings.forEach((booking, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${booking.TenKH}</td>
                <td>${booking.MaPhong}</td>
                <td>${booking.LoaiPhong}</td>
                <td>${booking.NgayDen}</td>
                <td>${booking.NgayDi}</td>
                <td>${booking.SoDem}</td>
                <td>${formatCurrency(booking.GiaHoaDon)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteBooking(${booking.MaHoaDon})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log('✓ Bookings loaded');
    } catch (error) {
        console.error('❌ Error loading bookings:', error);
    }
}

// ===================================================================
// Create Booking Modal
// ===================================================================
async function loadRoomsToSelect() {
    try {
        const response = await fetch(`${API_URL}/admin/phong`);
        const rooms = await response.json();

        const roomSelect = document.getElementById('bookingRoom');
        if (!roomSelect) return;

        roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>';
        rooms.forEach(room => {
            if (room.TrangThaiPhong === 'Trống') {
                const option = document.createElement('option');
                option.value = room.MaPhong;
                option.textContent = `${room.TenPhong} (${formatCurrency(room.DonGia)}/đêm)`;
                roomSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('❌ Error loading rooms:', error);
    }
}

// ===================================================================
// Save Booking
// ===================================================================
async function saveBooking() {
    try {
        const bookingData = {
            name: document.getElementById('bookingGuestName').value,
            email: document.getElementById('bookingGuestEmail').value,
            phone: document.getElementById('bookingGuestPhone').value,
            cccd: document.getElementById('bookingGuestCCCD').value,
            ma_phong: document.getElementById('bookingRoom').value,
            check_in: document.getElementById('bookingCheckIn').value,
            check_out: document.getElementById('bookingCheckOut').value
        };

        if (!bookingData.name || !bookingData.email || !bookingData.ma_phong || !bookingData.check_in || !bookingData.check_out) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const response = await fetch(`${API_URL}/admin/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Tạo đặt phòng thành công!');
            document.getElementById('bookingModal').classList.remove('show');
            document.getElementById('bookingForm').reset();
            loadBookings();
            // Restore active tab after a micro delay
            setTimeout(() => {
                const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                if (tabNav && !tabNav.classList.contains('active')) {
                    tabNav.click();
                }
            }, 100);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Delete Booking
// ===================================================================
async function deleteBooking(maHoaDon) {
    if (!confirm('Xác nhận xóa đặt phòng này?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/bookings/${maHoaDon}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Xóa thành công');
            loadBookings();
            // Restore active tab
            setTimeout(() => {
                const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                if (tabNav && !tabNav.classList.contains('active')) {
                    tabNav.click();
                }
            }, 100);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Load Rooms
// ===================================================================
async function loadPhongs() {
    try {
        const response = await fetch(`${API_URL}/admin/phong`);
        const rooms = await response.json();

        const tbody = document.getElementById('phongTableBody') || createPhongTable();

        tbody.innerHTML = '';

        if (rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">Không có phòng</td></tr>';
            return;
        }

        rooms.forEach((room, index) => {
            const row = document.createElement('tr');
            const statusClass = room.TrangThaiPhong === 'Trống' ? 'status-empty' : 'status-booked';
            const imageHtml = room.HinhAnh 
                ? `<img src="${room.HinhAnh}" alt="${room.TenPhong}" style="height: 50px; border-radius: 4px; object-fit: cover;">` 
                : '<span style="color: #999;">Không có ảnh</span>';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${room.MaPhong}</td>
                <td>${room.TenPhong}</td>
                <td>${room.LoaiPhong}</td>
                <td>${imageHtml}</td>
                <td>${formatCurrency(room.DonGia)}</td>
                <td>${room.SucChua || '-'}</td>
                <td><span class="${statusClass}">${room.TrangThaiPhong}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editPhong('${room.MaPhong}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePhong('${room.MaPhong}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log('✓ Rooms loaded');
    } catch (error) {
        console.error('❌ Error loading rooms:', error);
    }
}

// Edit Room
async function editPhong(maPhong) {
    try {
        const response = await fetch(`${API_URL}/admin/phong`);
        const rooms = await response.json();
        const room = rooms.find(r => r.MaPhong === maPhong);
        
        if (room) {
            currentEditingId = maPhong;
            currentEditingType = 'phong';
            document.getElementById('phongModalTitle').textContent = 'Chỉnh sửa phòng';
            document.getElementById('maPhong').value = room.MaPhong;
            document.getElementById('maPhong').disabled = true;
            document.getElementById('tenPhong').value = room.TenPhong;
            document.getElementById('loaiPhong').value = room.LoaiPhong;
            document.getElementById('donGia').value = room.DonGia;
            document.getElementById('sucChua').value = room.SucChua;
            document.getElementById('moTa').value = room.MoTa || '';
            document.getElementById('trangThaiPhong').value = room.TrangThaiPhong;
            
            // Show existing image if available
            const hinhAnhPhong = document.getElementById('hinhAnhPhong');
            if (hinhAnhPhong) {
                hinhAnhPhong.value = ''; // Reset file input
            }
            
            if (room.HinhAnh) {
                const preview = document.getElementById('hinhAnhPreview');
                const previewGroup = document.getElementById('imagePreviewGroup');
                preview.src = room.HinhAnh;
                previewGroup.style.display = 'block';
            } else {
                document.getElementById('imagePreviewGroup').style.display = 'none';
            }
            
            document.getElementById('phongModal').classList.add('show');
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Delete Room
// ===================================================================
async function deletePhong(maPhong) {
    if (!confirm('Xác nhận xóa phòng này?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/phong/${maPhong}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Xóa thành công');
            loadPhongs();
            // Restore active tab
            setTimeout(() => {
                const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                if (tabNav && !tabNav.classList.contains('active')) {
                    tabNav.click();
                }
            }, 100);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Load Staff
// ===================================================================
async function loadNhanViens() {
    try {
        const response = await fetch(`${API_URL}/admin/nhanvien`);
        const staff = await response.json();

        const tbody = document.getElementById('nhanvienTableBody') || createNhanVienTable();

        tbody.innerHTML = '';

        if (staff.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">Không có nhân viên</td></tr>';
            return;
        }

        staff.forEach((nv, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${nv.TenNV}</td>
                <td>${nv.Email}</td>
                <td>${nv.ChucVu || '-'}</td>
                <td>${nv.SdtNv || '-'}</td>
                <td>${formatCurrency(nv.Luong)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editNhanVien(${nv.MaNV})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNhanVien(${nv.MaNV})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log('✓ Staff loaded');
    } catch (error) {
        console.error('❌ Error loading staff:', error);
    }
}

// Edit Staff
async function editNhanVien(maNV) {
    try {
        const response = await fetch(`${API_URL}/admin/nhanvien`);
        const staff = await response.json();
        const nv = staff.find(n => n.MaNV === maNV);
        
        if (nv) {
            currentEditingId = maNV;
            currentEditingType = 'nhanvien';
            document.getElementById('nhanvienModalTitle').textContent = 'Chỉnh sửa nhân viên';
            document.getElementById('tenNV').value = nv.TenNV;
            document.getElementById('chucVu').value = nv.ChucVu;
            document.getElementById('emailNV').value = nv.Email;
            document.getElementById('sdtNV').value = nv.SdtNv || '';
            document.getElementById('luongNV').value = nv.Luong;
            document.getElementById('nhanvienModal').classList.add('show');
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Delete Staff
// ===================================================================
async function deleteNhanVien(maNV) {
    if (!confirm('Xác nhận xóa nhân viên này?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/nhanvien/${maNV}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Xóa thành công');
            loadNhanViens();
            // Restore active tab
            setTimeout(() => {
                const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                if (tabNav && !tabNav.classList.contains('active')) {
                    tabNav.click();
                }
            }, 100);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Load Services
// ===================================================================
async function loadDichVus() {
    try {
        const response = await fetch(`${API_URL}/admin/dichvu`);
        const services = await response.json();

        const tbody = document.getElementById('dichvuTableBody') || createDichVuTable();

        tbody.innerHTML = '';

        if (services.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Không có dịch vụ</td></tr>';
            return;
        }

        services.forEach((dv, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${dv.TenDichVu}</td>
                <td>${formatCurrency(dv.DonGia)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editDichVu(${dv.MaDichVu})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDichVu(${dv.MaDichVu})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log('✓ Services loaded');
    } catch (error) {
        console.error('❌ Error loading services:', error);
    }
}

// Edit Service
async function editDichVu(maDV) {
    try {
        const response = await fetch(`${API_URL}/admin/dichvu`);
        const services = await response.json();
        const dv = services.find(d => d.MaDichVu === maDV);
        
        if (dv) {
            currentEditingId = maDV;
            currentEditingType = 'dichvu';
            document.getElementById('dichvuModalTitle').textContent = 'Chỉnh sửa dịch vụ';
            document.getElementById('tenDichVu').value = dv.TenDichVu;
            document.getElementById('donGiaDichVu').value = dv.DonGia;
            document.getElementById('dichvuModal').classList.add('show');
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Delete Service
// ===================================================================
async function deleteDichVu(maDV) {
    if (!confirm('Xác nhận xóa dịch vụ này?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/dichvu/${maDV}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Xóa thành công');
            loadDichVus();
            // Restore active tab
            setTimeout(() => {
                const tabNav = document.querySelector(`[data-tab="${currentActiveTab}"]`);
                if (tabNav && !tabNav.classList.contains('active')) {
                    tabNav.click();
                }
            }, 100);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// ===================================================================
// Load Report Content
// ===================================================================
async function loadReportContent() {
    try {
        const reportContent = document.getElementById('reportContent');
        const fromDate = document.getElementById('reportFrom').value;
        const toDate = document.getElementById('reportTo').value;

        if (!fromDate || !toDate) {
            reportContent.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Vui lòng chọn khoảng thời gian</p>';
            return;
        }

        // Show loading message
        reportContent.innerHTML = '<p style="text-align: center; padding: 20px;">Đang tải báo cáo...</p>';

        // Fetch all reports
        const [revenueRes, bookingRes, roomRes] = await Promise.all([
            fetch(`${API_URL}/admin/reports/revenue`),
            fetch(`${API_URL}/admin/reports/booking-stats`),
            fetch(`${API_URL}/admin/reports/room-type-report`)
        ]);

        const revenue = await revenueRes.json();
        const booking = await bookingRes.json();
        const room = await roomRes.json();

        // Build report HTML
        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <!-- Revenue Section -->
                <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px;">
                    <h4 style="margin-top: 0; color: #3b82f6;">💰 Doanh thu</h4>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #000;">${formatCurrency(revenue.total_revenue)}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Tổng đơn đặt: ${revenue.total_bookings}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Trung bình/đơn: ${formatCurrency(revenue.average_booking_value)}</p>
                </div>

                <!-- Booking Section -->
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px;">
                    <h4 style="margin-top: 0; color: #10b981;">📅 Đặt phòng</h4>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #000;">${booking.total_bookings} đơn</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Tỷ lệ lấp phòng: ${booking.occupancy_rate.toFixed(1)}%</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Phòng trống: ${booking.empty_rooms}</p>
                </div>

                <!-- Room Type Section -->
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                    <h4 style="margin-top: 0; color: #f59e0b;">🏨 Loại phòng</h4>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Phổ biến nhất:</strong> ${room.most_booked_type || 'N/A'}</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Doanh thu cao nhất:</strong> ${room.highest_revenue_type || 'N/A'}</p>
                </div>
            </div>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <h3>📊 Doanh thu theo tháng</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #e5e7eb;">
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Tháng</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${revenue.monthly.map(m => `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 10px;">${m.month}</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold;">${formatCurrency(m.revenue)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="text-align: center;">
                <button class="btn btn-primary" onclick="exportReportCSV()">
                    <i class="fas fa-download"></i> Tải CSV
                </button>
            </div>
        `;

        reportContent.innerHTML = html;

    } catch (error) {
        document.getElementById('reportContent').innerHTML = `<p style="color: red;">❌ Lỗi: ${error.message}</p>`;
    }
}

// Export report to CSV
function exportReportCSV() {
    const fromDate = document.getElementById('reportFrom').value;
    const toDate = document.getElementById('reportTo').value;
    
    if (!fromDate || !toDate) {
        alert('Vui lòng chọn khoảng thời gian!');
        return;
    }

    const csv = `Báo cáo khách sạn Miranda\nTừ: ${fromDate}\nĐến: ${toDate}\n\n`;
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `baocao_${fromDate}_${toDate}.csv`;
    link.click();
    alert('✓ Tải xuống báo cáo thành công!');
}

// Setup Report Listeners
function setupReportListeners() {
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
        generateBtn.addEventListener('click', loadReportContent);
    }
}

// ===================================================================
// Logout
// ===================================================================
function handleLogout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminData');
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// ===================================================================
// Utilities
// ===================================================================
function formatCurrency(value) {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function createPhongTable() {
    const section = document.getElementById('phong');
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Mã phòng</th>
                <th>Tên phòng</th>
                <th>Loại</th>
                <th>Ảnh</th>
                <th>Giá</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody id="phongTableBody"></tbody>
    `;
    section.appendChild(table);
    return table.querySelector('tbody');
}

function createNhanVienTable() {
    const section = document.getElementById('nhanvien');
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Chức vụ</th>
                <th>SĐT</th>
                <th>Lương</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody id="nhanvienTableBody"></tbody>
    `;
    section.appendChild(table);
    return table.querySelector('tbody');
}

function createDichVuTable() {
    const section = document.getElementById('dichvu');
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Tên dịch vụ</th>
                <th>Giá</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody id="dichvuTableBody"></tbody>
    `;
    section.appendChild(table);
    return table.querySelector('tbody');
}
