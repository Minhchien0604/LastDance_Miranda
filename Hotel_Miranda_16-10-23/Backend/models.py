from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
db = SQLAlchemy()

#Bảng khách hàng
class KhachHang(db.Model):
    __tablename__ = 'KhachHang'
    MaKhachHang = db.Column(db.Integer, primary_key = True, autoincrement = True)
    TenKH = db.Column (db.String(100), nullable = False)
    SdtKH = db.Column (db.String(15), nullable = False)
    CCCD_Passport = db.Column (db.String(20), nullable = False)
    Email = db.Column (db.String(50), unique = True)
    MatKhau = db.Column(db.String(255))
    hoadons = db.relationship('HoaDon', backref='khachhang', lazy=True)

#Bảng nhân viên
class TrangThaiEnum(Enum):
    DANG_LAM = "Đang làm việc"
    NGHI_VIEC = "Nghỉ việc"

class NhanVien (db.Model):
    __tablename__ = 'NhanVien'
    MaNV = db.Column (db.Integer, primary_key = True, autoincrement=True)
    TenNV = db.Column (db.String(100), nullable=False)
    ChucVu = db.Column (db.String (50))
    VaiTro = db.Column (db.String (50))
    NgaySinh = db.Column (db.Date)
    Email = db.Column (db.String(50), unique = True)
    TrangThaiNV = db.Column (db.Enum(TrangThaiEnum), default=TrangThaiEnum.DANG_LAM)
    SdtNv = db.Column (db.String (15))
    Luong = db.Column (db.Float)
    MatKhau = db.Column(db.String(255))
    #Mối quan hệ 1 - nhiều với bảng HoaDon
    hoadons = db.relationship('HoaDon', backref='nhanvien', lazy=True) 

#Bảng Phòng
class Phong (db.Model):
    __tablename__ = 'Phong'
    MaPhong = db.Column (db.String (20), primary_key = True)
    TenPhong = db.Column (db.String (100), nullable = False)
    LoaiPhong = db.Column (db.String (50), nullable = False)
    TrangThaiPhong = db.Column (db.String (50), default = "Trống")
    DonGia = db.Column (db.Float, nullable = False)
    SucChua = db.Column (db.Integer)
    MoTa = db.Column (db.Text)
    HinhAnh = db.Column (db.String (255)) 

    chi_tiet_phong = db.relationship('HoaDon_Phong', backref = 'phong', lazy = True)

class DichVu (db.Model):
    __tablename__ = 'DichVu'
    MaDichVu = db.Column (db.Integer, primary_key=True, autoincrement=True)
    TenDichVu = db.Column (db.String (100), nullable=False)
    DonGia = db.Column (db.Float, nullable = False)
    chi_tiet_dichvu = db.relationship('HoaDon_DichVu', backref = 'dichvu', lazy = True)

class HoaDon (db.Model):
    __tablename__ = 'HoaDon'
    MaHoaDon = db.Column(db.Integer, primary_key=True, autoincrement=True)
    MaNV = db.Column(db.Integer, db.ForeignKey('NhanVien.MaNV'), nullable=True)
    MaKhachHang = db.Column(db.Integer, db.ForeignKey('KhachHang.MaKhachHang'), nullable=False)
    Ngay = db.Column(db.DateTime, default=datetime.utcnow)
    DenBu = db.Column(db.Float, default=0.0)
    GiaHoaDon = db.Column(db.Float, nullable=False)

    # Mối quan hệ với các bảng chi tiết
    chi_tiet_phong = db.relationship('HoaDon_Phong', backref='hoadon', lazy=True)
    chi_tiet_dichvu = db.relationship('HoaDon_DichVu', backref='hoadon', lazy=True)

# 6. Bảng Chi Tiết Hóa Đơn - Phòng (Bảng trung gian n-n)
class HoaDon_Phong(db.Model):
    __tablename__ = 'HoaDon_Phong'
    # Khóa chính kép (Composite Primary Key)
    MaHoaDon = db.Column(db.Integer, db.ForeignKey('HoaDon.MaHoaDon'), primary_key=True)
    MaPhong = db.Column(db.String(20), db.ForeignKey('Phong.MaPhong'), primary_key=True)
    NgayDen = db.Column(db.Date, nullable=False)
    NgayDi = db.Column(db.Date, nullable=False)

# 7. Bảng Chi Tiết Hóa Đơn - Dịch Vụ (Bảng trung gian n-n)
class HoaDon_DichVu(db.Model):
    __tablename__ = 'HoaDon_DichVu'
    # Khóa chính kép (Composite Primary Key)
    MaHoaDon = db.Column(db.Integer, db.ForeignKey('HoaDon.MaHoaDon'), primary_key=True)
    MaDichVu = db.Column(db.Integer, db.ForeignKey('DichVu.MaDichVu'), primary_key=True)
    SoLuong = db.Column(db.Integer, nullable=False, default=1)

class ThucDon (db.Model):
    __tablename__ = 'ThucDon'
    MaMon = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TenMon = db.Column(db.String(100), nullable=False)
    MoTa = db.Column(db.Text)
    HinhAnh = db.Column(db.String(255))

class TinTuc(db.Model):
    __tablename__ = 'TinTuc'
    MaTinTuc = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TieuDe = db.Column(db.String(200), nullable=False)
    NoiDung = db.Column(db.Text)
    NgayDang = db.Column(db.String(50))
    TacGia = db.Column(db.String(50))
    HinhAnh = db.Column(db.String(255))