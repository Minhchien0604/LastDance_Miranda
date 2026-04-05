# 🏨 Hotel Miranda - REST API Documentation

**Base URL**: `http://127.0.0.1:5000/api`

---

## 📋 TABLE OF CONTENTS
1. [Authentication APIs](#authentication-apis)
2. [Business APIs](#business-apis)
3. [Admin Dashboard Stats](#admin-dashboard-stats)
4. [Booking Management](#booking-management)
5. [Room Management](#room-management)
6. [Staff Management](#staff-management)
7. [Service Management](#service-management)
8. [Customer Management](#customer-management)
9. [Reports & Statistics](#reports--statistics)
10. [Search & Export](#search--export)

---

## 🔐 AUTHENTICATION APIS

### Register
**POST** `/register`

```json
{
  "ten_kh": "Nguyễn Văn A",
  "email": "user@example.com",
  "mat_khau": "password123"
}
```

**Response** (201):
```json
{
  "message": "Đăng ký thành công!"
}
```

### Login
**POST** `/login`

```json
{
  "email": "admin@hotel.com",
  "mat_khau": "admin123"
}
```

**Response** (200):
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "ten_kh": "Admin",
    "email": "admin@hotel.com",
    "is_admin": true
  }
}
```

### Google Login
**POST** `/google-login`

```json
{
  "token": "google_access_token"
}
```

---

## 🏨 BUSINESS APIS

### Get All Rooms
**GET** `/phong`

**Response** (200):
```json
[
  {
    "MaPhong": "P01",
    "TenPhong": "Deluxe Suite",
    "MoTa": "Phòng đẳng cấp",
    "DonGia": 399.0,
    "HinhAnh": "assets/room-1.jpg"
  }
]
```

### Get Available Rooms
**GET** `/phong-trong`

### Get Menu Items
**GET** `/thucdon`

### Get News
**GET** `/tintuc`

### Create Booking
**POST** `/booking`

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "room_type": "Deluxe",
  "check_in": "2024-04-10",
  "check_out": "2024-04-12"
}
```

---

## 📊 ADMIN DASHBOARD STATS

### Get Dashboard Statistics
**GET** `/admin/dashboard-stats`

**Response** (200):
```json
{
  "total_rooms": 3,
  "empty_rooms": 2,
  "booked_rooms": 1,
  "total_revenue": 1197.0,
  "total_customers": 5,
  "total_staff": 0
}
```

---

## 📅 BOOKING MANAGEMENT

### Get All Bookings
**GET** `/admin/bookings`

**Response** (200):
```json
[
  {
    "MaHoaDon": 1,
    "TenKH": "Nguyễn Văn A",
    "Email": "user@example.com",
    "SdtKH": "0123456789",
    "MaPhong": "P01",
    "TenPhong": "Deluxe Suite",
    "LoaiPhong": "Deluxe",
    "NgayDen": "2024-04-10",
    "NgayDi": "2024-04-12",
    "SoDem": 2,
    "GiaHoaDon": 798.0,
    "Ngay": "2024-04-05T10:30:00"
  }
]
```

### Create Booking (Admin)
**POST** `/admin/bookings`

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "cccd": "012345678901",
  "ma_phong": "P01",
  "check_in": "2024-04-10",
  "check_out": "2024-04-12"
}
```

**Response** (201):
```json
{
  "message": "Tạo đặt phòng thành công",
  "MaHoaDon": 2
}
```

### Delete Booking
**DELETE** `/admin/bookings/<ma_hoa_don>`

---

## 🏠 ROOM MANAGEMENT

### Get All Rooms (Admin)
**GET** `/admin/phong`

**Response** (200):
```json
[
  {
    "MaPhong": "P01",
    "TenPhong": "Deluxe Suite",
    "LoaiPhong": "Deluxe",
    "DonGia": 399.0,
    "TrangThaiPhong": "Trống",
    "SucChua": 2,
    "MoTa": "Phòng đẳng cấp",
    "HinhAnh": "assets/room-1.jpg"
  }
]
```

### Create Room
**POST** `/admin/phong`

```json
{
  "ma_phong": "P04",
  "ten_phong": "Suite Room",
  "loai_phong": "Suite",
  "don_gia": 499.0,
  "suc_chua": 3,
  "mo_ta": "Phòng suite cao cấp",
  "hinh_anh": "assets/room-4.jpg"
}
```

### Update Room
**PUT** `/admin/phong/<ma_phong>`

```json
{
  "ten_phong": "Deluxe Suite Updated",
  "loai_phong": "Deluxe",
  "don_gia": 450.0,
  "suc_chua": 2,
  "mo_ta": "Cập nhật mô tả",
  "hinh_anh": "assets/room-1-new.jpg",
  "trang_thai": "Trống"
}
```

### Delete Room
**DELETE** `/admin/phong/<ma_phong>`

---

## 👥 STAFF MANAGEMENT

### Get All Staff
**GET** `/admin/nhanvien`

**Response** (200):
```json
[
  {
    "MaNV": 1,
    "TenNV": "Nguyễn Văn B",
    "ChucVu": "Lễ tân",
    "VaiTro": "Reception",
    "Email": "staff@hotel.com",
    "SdtNv": "0987654321",
    "Luong": 5000000.0,
    "TrangThaiNV": "Đang làm việc"
  }
]
```

### Create Staff
**POST** `/admin/nhanvien`

```json
{
  "ten_nv": "Trần Thị C",
  "chuc_vu": "Housekeeping",
  "vai_tro": "Cleaning",
  "email": "housekeeping@hotel.com",
  "sdt": "0912345678",
  "luong": 4000000.0,
  "mat_khau": "password123"
}
```

### Update Staff
**PUT** `/admin/nhanvien/<ma_nv>`

```json
{
  "ten_nv": "Trần Thị C",
  "chuc_vu": "Senior Housekeeping",
  "vai_tro": "Cleaning Supervisor",
  "email": "senior@hotel.com",
  "sdt": "0912345678",
  "luong": 5000000.0
}
```

### Delete Staff
**DELETE** `/admin/nhanvien/<ma_nv>`

---

## 🛎️ SERVICE MANAGEMENT

### Get All Services
**GET** `/admin/dichvu`

**Response** (200):
```json
[
  {
    "MaDichVu": 1,
    "TenDichVu": "Room Cleaning",
    "DonGia": 50000.0
  }
]
```

### Create Service
**POST** `/admin/dichvu`

```json
{
  "ten_dich_vu": "Spa Service",
  "don_gia": 250000.0
}
```

### Update Service
**PUT** `/admin/dichvu/<ma_dv>`

```json
{
  "ten_dich_vu": "Premium Spa Service",
  "don_gia": 300000.0
}
```

### Delete Service
**DELETE** `/admin/dichvu/<ma_dv>`

---

## 👨‍💼 CUSTOMER MANAGEMENT

### Get All Customers
**GET** `/admin/customers`

**Response** (200):
```json
[
  {
    "MaKhachHang": 1,
    "TenKH": "Nguyễn Văn A",
    "Email": "user@example.com",
    "SdtKH": "0123456789",
    "CCCD_Passport": "012345678901"
  }
]
```

---

## 📈 REPORTS & STATISTICS

### Revenue Report
**GET** `/admin/reports/revenue`

**Response** (200):
```json
{
  "total_revenue": 1197.0,
  "total_bookings": 1,
  "average_booking_value": 1197.0,
  "monthly": [
    {
      "month": "2024-04",
      "revenue": 1197.0
    }
  ]
}
```

### Booking Statistics
**GET** `/admin/reports/booking-stats`

**Response** (200):
```json
{
  "total_bookings": 1,
  "occupancy_rate": 33.33,
  "rooms_status": {
    "empty": 2,
    "booked": 1,
    "maintenance": 0
  }
}
```

### Room Type Report
**GET** `/admin/reports/room-type-report`

**Response** (200):
```json
{
  "report": {
    "Deluxe": {
      "total": 1,
      "empty": 0,
      "booked": 1,
      "avg_price": 399.0
    },
    "Family": {
      "total": 1,
      "empty": 1,
      "booked": 0,
      "avg_price": 599.0
    },
    "Standard": {
      "total": 1,
      "empty": 1,
      "booked": 0,
      "avg_price": 199.0
    }
  },
  "timestamp": "2024-04-05T10:30:00.000000"
}
```

---

## 🔍 SEARCH & EXPORT

### Search Bookings
**POST** `/admin/bookings/search`

```json
{
  "query": "Nguyễn"
}
```

### Search Rooms
**POST** `/admin/phong/search`

```json
{
  "query": "Deluxe",
  "loai_phong": "Deluxe",
  "trang_thai": "Trống"
}
```

### Export Bookings
**GET** `/admin/export/bookings`

**Response** (200):
```json
{
  "data": [
    {
      "MaHoaDon": 1,
      "TenKH": "Nguyễn Văn A",
      "Email": "user@example.com",
      "SdtKH": "0123456789",
      "MaPhong": "P01",
      "TenPhong": "Deluxe Suite",
      "LoaiPhong": "Deluxe",
      "NgayDen": "10-04-2024",
      "NgayDi": "12-04-2024",
      "GiaHoaDon": 798.0
    }
  ],
  "total": 1
}
```

---

## 🔑 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Invalid credentials |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## 📌 Testing with cURL

### Login
```bash
curl -X POST http://127.0.0.1:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","mat_khau":"admin123"}'
```

### Get Dashboard Stats
```bash
curl http://127.0.0.1:5000/api/admin/dashboard-stats
```

### Get All Bookings
```bash
curl http://127.0.0.1:5000/api/admin/bookings
```

### Create Booking
```bash
curl -X POST http://127.0.0.1:5000/api/admin/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "phone":"0123456789",
    "cccd":"ABC123",
    "ma_phong":"P01",
    "check_in":"2024-04-15",
    "check_out":"2024-04-17"
  }'
```

---

**Last Updated**: April 5, 2024
**Version**: 1.0
