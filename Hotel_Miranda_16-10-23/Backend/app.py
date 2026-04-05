import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from models import db, Phong, ThucDon, TinTuc, HoaDon, HoaDon_Phong, HoaDon_DichVu, KhachHang, NhanVien, DichVu
from datetime import datetime, timedelta
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid
import google.generativeai as genai
from dotenv import load_dotenv
app = Flask(__name__)
CORS(app)


# ===== IMAGE UPLOAD CONFIG =====
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'Frontend', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'hotel_miranda.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
load_dotenv() # Tải API Key từ file .env
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")
# ===== HELPER FUNCTIONS =====
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_upload_file(file):
    if file and file.filename and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Tạo tên file unique
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        return f"uploads/{unique_filename}"
    return None

# ===== IMAGE UPLOAD API =====
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'Không có file được upload'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'File rỗng'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Định dạng file không được phép. Chỉ chấp nhận: png, jpg, jpeg, gif, webp'}), 400
        
        if len(file.read()) > MAX_FILE_SIZE:
            return jsonify({'message': 'File quá lớn. Tối đa 5MB'}), 400
        
        file.seek(0)  # Reset file pointer
        image_path = save_upload_file(file)
        
        if image_path:
            return jsonify({
                'message': 'Upload thành công',
                'image_path': image_path,
                'full_url': f'http://127.0.0.1:5000/{image_path}'
            }), 200
        else:
            return jsonify({'message': 'Lỗi upload file'}), 500
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ===== CÁC API XÁC THỰC (AUTH) =====
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    ten_kh = data.get('ten_kh')
    email = data.get('email')
    mat_khau = data.get('mat_khau')

    # Kiểm tra xem Email đã tồn tại chưa
    user_exists = KhachHang.query.filter_by(Email=email).first()
    if user_exists:
        return jsonify({'message': 'Email này đã được sử dụng!'}), 400

    # Mã hóa mật khẩu
    hashed_password = generate_password_hash(mat_khau)

    # Thêm user mới
    new_user = KhachHang(
        TenKH=ten_kh,
        Email=email,
        MatKhau=hashed_password,
        SdtKH="Chưa cập nhật", 
        CCCD_Passport="CCCD_" + str(int(datetime.utcnow().timestamp())) 
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Đăng ký thành công!'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    mat_khau = data.get('mat_khau')

    user = KhachHang.query.filter_by(Email=email).first()

    # Kiểm tra user có tồn tại, có mật khẩu trong DB và mật khẩu nhập vào có khớp không
    if user and user.MatKhau and check_password_hash(user.MatKhau, mat_khau):
        return jsonify({
            'message': 'Đăng nhập thành công',
            'user': {
                'id': user.MaKhachHang,
                'ten_kh': user.TenKH,
                'email': user.Email,
                'is_admin': user.IsAdmin
            }
        }), 200
    else:
        return jsonify({'message': 'Email hoặc mật khẩu không chính xác!'}), 401


# ==========================================
# CÁC API NGHIỆP VỤ KHÁCH SẠN
# ==========================================
@app.route('/api/phong', methods=['GET'])
def get_phong():
    danh_sach_phong = Phong.query.all()
    ket_qua = []
    for p in danh_sach_phong:
        ket_qua.append({
            "MaPhong": p.MaPhong,
            "TenPhong": p.TenPhong,
            "MoTa": p.MoTa,
            "DonGia": p.DonGia,
            "HinhAnh": p.HinhAnh if p.HinhAnh else "assets/room-1.jpg"
        })
    return jsonify(ket_qua)

@app.route('/api/thucdon', methods=['GET'])
def get_thucdon():
    danh_sach_mon = ThucDon.query.all()
    ket_qua = []
    for m in danh_sach_mon:
        ket_qua.append({
            "MaMon": m.MaMon,
            "TenMon": m.TenMon,
            "MoTa": m.MoTa,
            "HinhAnh": m.HinhAnh if m.HinhAnh else "assets/food-1.jpg"
        })
    return jsonify(ket_qua)

@app.route('/api/tintuc', methods=['GET'])
def get_tintuc():
    danh_sach_tin = TinTuc.query.all()
    ket_qua = []
    for t in danh_sach_tin:
        ket_qua.append({
            "MaTinTuc": t.MaTinTuc,
            "TieuDe": t.TieuDe,
            "NoiDung": t.NoiDung,
            "NgayDang": t.NgayDang,
            "TacGia": t.TacGia,
            "HinhAnh": t.HinhAnh if t.HinhAnh else "assets/news-1.jpg"
        })
    return jsonify(ket_qua)

@app.route('/api/booking',methods=['POST'])
def create_booking():
    data = request.json
    try:
        #Tạo hoặc lấy thông tin khách hàng dựa vào email hoặc sdt
        khach = KhachHang.query.filter_by(Email=data['email']).first()
        if not khach:
            khach = KhachHang(
                TenKH = data['name'],
                SdtKH = data['phone'],
                Email = data['email'],
                CCCD_Passport = "Chưa cập nhật"
            )
            db.session.add(khach)
            db.session.flush() #Lấy mã khách hàng vừa tạo
        
        #Tạo hóa đơn mới
        hoa_don_moi = HoaDon(
            MaKhachHang = khach.MaKhachHang,
            GiaHoaDon = 0.0, #Sẽ tính sau khi thêm phòng và dịch vụ
            DenBu = 0.0
        )

        db.session.add(hoa_don_moi)
        db.session.flush() #Lấy mã hóa đơn vừa tạo

        phong_chon = Phong.query.filter_by(LoaiPhong=data['room_type'], TrangThaiPhong='Trống').first()
        if not phong_chon:
            return jsonify({"message": "Không còn phòng trống loại này"}), 400
        
        ngayden = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        ngaydi = datetime.strptime(data['check_out'], '%Y-%m-%d').date()

        so_dem = (ngaydi - ngayden).days
        if so_dem <= 0:
            so_dem = 1 # Tránh lỗi đặt cùng ngày
        tong_tien = phong_chon.DonGia * so_dem
        hoa_don_moi.GiaHoaDon = tong_tien
        
        chi_tiet_phong = HoaDon_Phong(
            MaHoaDon = hoa_don_moi.MaHoaDon,
            MaPhong = phong_chon.MaPhong,
            NgayDen = ngayden,
            NgayDi = ngaydi
        )

        phong_chon.TrangThaiPhong = "Đã đặt"
        db.session.add(chi_tiet_phong)
        db.session.commit()
        return jsonify({"message": "Đặt phòng thành công", "booking_id": hoa_don_moi.MaHoaDon}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Đặt phòng thất bại", "error": str(e)}), 500
    
@app.route('/api/phong-trong', methods=['GET'])
def get_phong_trong():
    # Lấy các phòng đang có trạng thái "Trống"
    phong_trong = Phong.query.filter_by(TrangThaiPhong="Trống").all()
    
    ket_qua = []
    for p in phong_trong:
        ket_qua.append({
            "MaPhong": p.MaPhong,
            "TenPhong": p.TenPhong,
            "LoaiPhong": p.LoaiPhong,
            "DonGia": p.DonGia,
            # Nếu đường dẫn ảnh ở Backend là "assets/...", ta cần chỉnh lại cho trang Booking
            "HinhAnh": f"../{p.HinhAnh}", 
            "MoTa": p.MoTa if p.MoTa else "Phòng nghỉ sang trọng, đầy đủ tiện nghi chuẩn 5 sao.",
            "SucChua": p.SucChua if p.SucChua else 2
        })
    return jsonify(ket_qua)

# ==========================================
# API ĐĂNG NHẬP BẰNG GOOGLE
# ==========================================

# ==========================================
# ADMIN APIS - QUẢN LÝ DASHBOARD
# ==========================================
@app.route('/api/admin/dashboard-stats', methods=['GET'])
def admin_dashboard_stats():
    try:
        # Tất cả phòng
        total_rooms = Phong.query.count()
        # Phòng trống
        empty_rooms = Phong.query.filter_by(TrangThaiPhong="Trống").count()
        # Phòng đã đặt
        booked_rooms = Phong.query.filter_by(TrangThaiPhong="Đã đặt").count()
        # Tổng doanh thu từ hóa đơn
        total_revenue = db.session.query(db.func.sum(HoaDon.GiaHoaDon)).scalar() or 0
        # Tổng khách hàng
        total_customers = KhachHang.query.filter_by(IsAdmin=False).count()
        # Tổng nhân viên
        total_staff = NhanVien.query.count()
        
        return jsonify({
            'total_rooms': total_rooms,
            'empty_rooms': empty_rooms,
            'booked_rooms': booked_rooms,
            'total_revenue': int(total_revenue),
            'total_customers': total_customers,
            'total_staff': total_staff
        }), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


# ==========================================
# ADMIN APIS - QUẢN LÝ ĐẶT PHÒNG
# ==========================================
@app.route('/api/admin/bookings', methods=['GET'])
def admin_get_bookings():
    try:
        hoadons = HoaDon.query.all()
        result = []
        for hd in hoadons:
            # Lấy khách hàng
            khach = KhachHang.query.get(hd.MaKhachHang)
            # Lấy chi tiết phòng
            for chi_tiet in hd.chi_tiet_phong:
                phong = Phong.query.get(chi_tiet.MaPhong)
                so_dem = (chi_tiet.NgayDi - chi_tiet.NgayDen).days
                result.append({
                    'MaHoaDon': hd.MaHoaDon,
                    'TenKH': khach.TenKH if khach else 'N/A',
                    'Email': khach.Email if khach else 'N/A',
                    'SdtKH': khach.SdtKH if khach else 'N/A',
                    'MaPhong': chi_tiet.MaPhong,
                    'TenPhong': phong.TenPhong,
                    'LoaiPhong': phong.LoaiPhong,
                    'NgayDen': chi_tiet.NgayDen.isoformat(),
                    'NgayDi': chi_tiet.NgayDi.isoformat(),
                    'SoDem': so_dem,
                    'GiaHoaDon': hd.GiaHoaDon,
                    'Ngay': hd.Ngay.isoformat()
                })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/bookings', methods=['POST'])
def admin_create_booking():
    try:
        data = request.json
        
        # Kiểm tra khách hàng
        khach = KhachHang.query.filter_by(Email=data['email']).first()
        if not khach:
            khach = KhachHang(
                TenKH=data['name'],
                Email=data['email'],
                SdtKH=data.get('phone', ''),
                CCCD_Passport=data.get('cccd', ''),
                MatKhau=generate_password_hash('123456')
            )
            db.session.add(khach)
            db.session.flush()
        
        # Tạo hóa đơn
        ngay_den = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        ngay_di = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
        so_dem = (ngay_di - ngay_den).days
        if so_dem <= 0:
            so_dem = 1
        
        # Lấy phòng
        phong = Phong.query.get(data['ma_phong'])
        if not phong:
            return jsonify({'message': 'Phòng không tồn tại'}), 400
        
        if phong.TrangThaiPhong != 'Trống':
            return jsonify({'message': 'Phòng không trống'}), 400
        
        gia_hoa_don = phong.DonGia * so_dem
        
        hoa_don = HoaDon(
            MaKhachHang=khach.MaKhachHang,
            GiaHoaDon=gia_hoa_don,
            DenBu=0.0
        )
        db.session.add(hoa_don)
        db.session.flush()
        
        # Tạo chi tiết phòng
        chi_tiet = HoaDon_Phong(
            MaHoaDon=hoa_don.MaHoaDon,
            MaPhong=phong.MaPhong,
            NgayDen=ngay_den,
            NgayDi=ngay_di
        )
        db.session.add(chi_tiet)
        
        # Cập nhật trạng thái phòng
        phong.TrangThaiPhong = "Đã đặt"
        
        db.session.commit()
        return jsonify({'message': 'Tạo đặt phòng thành công', 'MaHoaDon': hoa_don.MaHoaDon}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/bookings/<int:ma_hoa_don>', methods=['DELETE'])
def admin_delete_booking(ma_hoa_don):
    try:
        hoa_don = HoaDon.query.get(ma_hoa_don)
        if not hoa_don:
            return jsonify({'message': 'Hóa đơn không tồn tại'}), 404
        
        # 1. Lặp qua các chi tiết phòng của hóa đơn
        for chi_tiet in hoa_don.chi_tiet_phong:
            # Cập nhật lại trạng thái phòng thành "Trống"
            phong = Phong.query.get(chi_tiet.MaPhong)
            if phong:
                phong.TrangThaiPhong = "Trống"
            
            # QUAN TRỌNG: Xóa bản ghi con (chi tiết phòng) trước!
            db.session.delete(chi_tiet)
        
        # 2. Sau khi đã dọn dẹp xong con, giờ mới xóa cha (Hóa đơn)
        db.session.delete(hoa_don)
        db.session.commit()
        return jsonify({'message': 'Xóa đặt phòng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500

# ==========================================
# ADMIN APIS - QUẢN LÝ PHÒNG
# ==========================================
@app.route('/api/admin/phong', methods=['GET'])
def admin_get_phong():
    try:
        phongs = Phong.query.all()
        result = []
        for p in phongs:
            result.append({
                'MaPhong': p.MaPhong,
                'TenPhong': p.TenPhong,
                'LoaiPhong': p.LoaiPhong,
                'DonGia': p.DonGia,
                'TrangThaiPhong': p.TrangThaiPhong,
                'SucChua': p.SucChua,
                'MoTa': p.MoTa,
                'HinhAnh': p.HinhAnh
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/phong', methods=['POST'])
def admin_create_phong():
    try:
        # Handle JSON data + file
        data = request.form if request.form else request.json
        
        # Kiểm tra mã phòng đã tồn tại
        if Phong.query.get(data.get('ma_phong')):
            return jsonify({'message': 'Mã phòng đã tồn tại'}), 400
        
        # Handle image upload
        image_path = None
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                image_path = save_upload_file(file)
        
        phong = Phong(
            MaPhong=data.get('ma_phong'),
            TenPhong=data.get('ten_phong'),
            LoaiPhong=data.get('loai_phong'),
            DonGia=float(data.get('don_gia')),
            SucChua=int(data.get('suc_chua', 2)),
            MoTa=data.get('mo_ta', ''),
            HinhAnh=image_path or data.get('hinh_anh', '')
        )
        db.session.add(phong)
        db.session.commit()
        return jsonify({'message': 'Tạo phòng thành công', 'image_path': image_path}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/phong/<ma_phong>', methods=['PUT'])
def admin_update_phong(ma_phong):
    try:
        phong = Phong.query.get(ma_phong)
        if not phong:
            return jsonify({'message': 'Phòng không tồn tại'}), 404
        
        # Handle JSON data + file
        data = request.form if request.form else request.json
        
        # Handle image upload (nếu có)
        image_path = None
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                image_path = save_upload_file(file)
        
        phong.TenPhong = data.get('ten_phong', phong.TenPhong)
        phong.LoaiPhong = data.get('loai_phong', phong.LoaiPhong)
        phong.DonGia = float(data.get('don_gia', phong.DonGia))
        phong.SucChua = int(data.get('suc_chua', phong.SucChua))
        phong.MoTa = data.get('mo_ta', phong.MoTa)
        
        # Update image if provided
        if image_path:
            phong.HinhAnh = image_path
        elif 'hinh_anh' in data:
            phong.HinhAnh = data.get('hinh_anh')
        
        phong.TrangThaiPhong = data.get('trang_thai', phong.TrangThaiPhong)
        
        db.session.commit()
        return jsonify({'message': 'Cập nhật phòng thành công', 'image_path': image_path}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/phong/<ma_phong>', methods=['DELETE'])
def admin_delete_phong(ma_phong):
    try:
        phong = Phong.query.get(ma_phong)
        if not phong:
            return jsonify({'message': 'Phòng không tồn tại'}), 404
        
        db.session.delete(phong)
        db.session.commit()
        return jsonify({'message': 'Xóa phòng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


# ==========================================
# ADMIN APIS - QUẢN LÝ NHÂN VIÊN
# ==========================================
@app.route('/api/admin/nhanvien', methods=['GET'])
def admin_get_nhanvien():
    try:
        nvs = NhanVien.query.all()
        result = []
        for nv in nvs:
            result.append({
                'MaNV': nv.MaNV,
                'TenNV': nv.TenNV,
                'ChucVu': nv.ChucVu,
                'VaiTro': nv.VaiTro,
                'Email': nv.Email,
                'SdtNv': nv.SdtNv,
                'Luong': nv.Luong,
                'TrangThaiNV': nv.TrangThaiNV.value if nv.TrangThaiNV else 'Đang làm việc'
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/nhanvien', methods=['POST'])
def admin_create_nhanvien():
    try:
        data = request.json
        
        nv = NhanVien(
            TenNV=data['ten_nv'],
            ChucVu=data.get('chuc_vu', ''),
            VaiTro=data.get('vai_tro', ''),
            Email=data['email'],
            SdtNv=data.get('sdt', ''),
            Luong=float(data.get('luong', 0)),
            MatKhau=generate_password_hash(data.get('mat_khau', '123456'))
        )
        db.session.add(nv)
        db.session.commit()
        return jsonify({'message': 'Tạo nhân viên thành công', 'MaNV': nv.MaNV}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/nhanvien/<int:ma_nv>', methods=['PUT'])
def admin_update_nhanvien(ma_nv):
    try:
        nv = NhanVien.query.get(ma_nv)
        if not nv:
            return jsonify({'message': 'Nhân viên không tồn tại'}), 404
        
        data = request.json
        nv.TenNV = data.get('ten_nv', nv.TenNV)
        nv.ChucVu = data.get('chuc_vu', nv.ChucVu)
        nv.VaiTro = data.get('vai_tro', nv.VaiTro)
        nv.Email = data.get('email', nv.Email)
        nv.SdtNv = data.get('sdt', nv.SdtNv)
        nv.Luong = float(data.get('luong', nv.Luong))
        
        db.session.commit()
        return jsonify({'message': 'Cập nhật nhân viên thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/nhanvien/<int:ma_nv>', methods=['DELETE'])
def admin_delete_nhanvien(ma_nv):
    try:
        nv = NhanVien.query.get(ma_nv)
        if not nv:
            return jsonify({'message': 'Nhân viên không tồn tại'}), 404
        
        db.session.delete(nv)
        db.session.commit()
        return jsonify({'message': 'Xóa nhân viên thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/dichvu', methods=['GET'])
def admin_get_dichvu():
    try:
        services = DichVu.query.all()
        result = []
        for service in services:
            result.append({
                'MaDichVu': service.MaDichVu,
                'TenDichVu': service.TenDichVu,
                'DonGia': service.DonGia
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/dichvu', methods=['POST'])
def admin_create_dichvu():
    try:
        data = request.json
        
        # Create new service
        dv = DichVu(
            TenDichVu=data.get('ten_dich_vu'),
            DonGia=float(data.get('don_gia'))
        )
        db.session.add(dv)
        db.session.commit()
        return jsonify({'message': 'Tạo dịch vụ thành công'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/dichvu/<int:ma_dv>', methods=['PUT'])
def admin_update_dichvu(ma_dv):
    try:
        dv = DichVu.query.get(ma_dv)
        if not dv:
            return jsonify({'message': 'Dịch vụ không tồn tại'}), 404
        
        data = request.json
        dv.TenDichVu = data.get('ten_dich_vu', dv.TenDichVu)
        dv.DonGia = float(data.get('don_gia', dv.DonGia))
        
        db.session.commit()
        return jsonify({'message': 'Cập nhật dịch vụ thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/dichvu/<int:ma_dv>', methods=['DELETE'])
def admin_delete_dichvu(ma_dv):
    try:
        dv = DichVu.query.get(ma_dv)
        if not dv:
            return jsonify({'message': 'Dịch vụ không tồn tại'}), 404
        
        db.session.delete(dv)
        db.session.commit()
        return jsonify({'message': 'Xóa dịch vụ thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


# ==========================================
# ADMIN APIS - QUẢN LÝ KHÁCH HÀNG
# ==========================================
@app.route('/api/admin/customers', methods=['GET'])
def admin_get_customers():
    try:
        customers = KhachHang.query.filter_by(IsAdmin=False).all()
        result = []
        for khach in customers:
            result.append({
                'MaKhachHang': khach.MaKhachHang,
                'TenKH': khach.TenKH,
                'Email': khach.Email,
                'SdtKH': khach.SdtKH,
                'CCCD_Passport': khach.CCCD_Passport
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


# ==========================================
# ADMIN APIS - BÁO CÁO & THỐNG KÊ
# ==========================================
@app.route('/api/admin/reports/revenue', methods=['GET'])
def admin_revenue_report():
    try:
        result = {
            'total_revenue': 0,
            'total_bookings': 0,
            'average_booking_value': 0,
            'monthly': []
        }
        
        hoadons = HoaDon.query.all()
        result['total_revenue'] = sum(h.GiaHoaDon for h in hoadons)
        result['total_bookings'] = len(hoadons)
        
        if len(hoadons) > 0:
            result['average_booking_value'] = result['total_revenue'] / len(hoadons)
        
        # Tính theo tháng
        from collections import defaultdict
        monthly_data = defaultdict(float)
        
        for hd in hoadons:
            month_key = hd.Ngay.strftime('%Y-%m') if hd.Ngay else '2024-01'
            monthly_data[month_key] += hd.GiaHoaDon
        
        for month in sorted(monthly_data.keys()):
            result['monthly'].append({
                'month': month,
                'revenue': monthly_data[month]
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/reports/booking-stats', methods=['GET'])
def admin_booking_stats():
    try:
        result = {
            'total_bookings': 0,
            'occupancy_rate': 0.0,
            'rooms_status': {
                'empty': 0,
                'booked': 0,
                'maintenance': 0
            }
        }
        
        hoadons = HoaDon.query.all()
        result['total_bookings'] = len(hoadons)
        
        # Tính trạng thái phòng
        phongs = Phong.query.all()
        for phong in phongs:
            if phong.TrangThaiPhong == 'Trống':
                result['rooms_status']['empty'] += 1
            elif phong.TrangThaiPhong == 'Đã đặt':
                result['rooms_status']['booked'] += 1
            else:
                result['rooms_status']['maintenance'] += 1
        
        # Tính occupancy rate
        if len(phongs) > 0:
            result['occupancy_rate'] = (result['rooms_status']['booked'] / len(phongs)) * 100
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/reports/room-type-report', methods=['GET'])
def admin_room_type_report():
    try:
        phongs = Phong.query.all()
        room_types = {}
        
        for phong in phongs:
            if phong.LoaiPhong not in room_types:
                room_types[phong.LoaiPhong] = {
                    'total': 0,
                    'empty': 0,
                    'booked': 0,
                    'avg_price': 0
                }
            
            room_types[phong.LoaiPhong]['total'] += 1
            if phong.TrangThaiPhong == 'Trống':
                room_types[phong.LoaiPhong]['empty'] += 1
            else:
                room_types[phong.LoaiPhong]['booked'] += 1
        
        # Tính giá trung bình
        for loai, data in room_types.items():
            phongs_loai = Phong.query.filter_by(LoaiPhong=loai).all()
            if phongs_loai:
                data['avg_price'] = sum(p.DonGia for p in phongs_loai) / len(phongs_loai)
        
        return jsonify({
            'report': room_types,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


# ==========================================
# ADMIN APIS - TÌM KIẾM & XUẤT DỮ LIỆU
# ==========================================
@app.route('/api/admin/bookings/search', methods=['POST'])
def admin_search_bookings():
    try:
        data = request.json
        query = data.get('query', '').lower()
        
        hoadons = HoaDon.query.all()
        results = []
        
        for hd in hoadons:
            khach = KhachHang.query.get(hd.MaKhachHang)
            if khach and (query in khach.TenKH.lower() or query in khach.Email.lower()):
                for chi_tiet in hd.chi_tiet_phong:
                    phong = Phong.query.get(chi_tiet.MaPhong)
                    so_dem = (chi_tiet.NgayDi - chi_tiet.NgayDen).days
                    results.append({
                        'MaHoaDon': hd.MaHoaDon,
                        'TenKH': khach.TenKH if khach else 'N/A',
                        'Email': khach.Email if khach else 'N/A',
                        'MaPhong': chi_tiet.MaPhong,
                        'TenPhong': phong.TenPhong,
                        'NgayDen': chi_tiet.NgayDen.isoformat(),
                        'NgayDi': chi_tiet.NgayDi.isoformat(),
                        'SoDem': so_dem,
                        'GiaHoaDon': hd.GiaHoaDon
                    })
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/phong/search', methods=['POST'])
def admin_search_phong():
    try:
        data = request.json
        query = data.get('query', '').lower()
        loai_phong = data.get('loai_phong', '')
        trang_thai = data.get('trang_thai', '')
        
        phongs = Phong.query.all()
        results = []
        
        for phong in phongs:
            if query and query not in phong.TenPhong.lower() and query not in phong.MaPhong.lower():
                continue
            
            if loai_phong and phong.LoaiPhong != loai_phong:
                continue
            
            if trang_thai and phong.TrangThaiPhong != trang_thai:
                continue
            
            results.append({
                'MaPhong': phong.MaPhong,
                'TenPhong': phong.TenPhong,
                'LoaiPhong': phong.LoaiPhong,
                'DonGia': phong.DonGia,
                'TrangThaiPhong': phong.TrangThaiPhong,
                'SucChua': phong.SucChua
            })
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


@app.route('/api/admin/export/bookings', methods=['GET'])
def admin_export_bookings():
    try:
        hoadons = HoaDon.query.all()
        result = []
        
        for hd in hoadons:
            khach = KhachHang.query.get(hd.MaKhachHang)
            for chi_tiet in hd.chi_tiet_phong:
                phong = Phong.query.get(chi_tiet.MaPhong)
                result.append({
                    'MaHoaDon': hd.MaHoaDon,
                    'TenKH': khach.TenKH if khach else 'N/A',
                    'Email': khach.Email if khach else 'N/A',
                    'SdtKH': khach.SdtKH if khach else 'N/A',
                    'MaPhong': chi_tiet.MaPhong,
                    'TenPhong': phong.TenPhong,
                    'LoaiPhong': phong.LoaiPhong,
                    'NgayDen': chi_tiet.NgayDen.strftime('%d-%m-%Y'),
                    'NgayDi': chi_tiet.NgayDi.strftime('%d-%m-%Y'),
                    'GiaHoaDon': hd.GiaHoaDon
                })
        
        return jsonify({'data': result, 'total': len(result)}), 200
    except Exception as e:
        return jsonify({'message': f'Lỗi: {str(e)}'}), 500


# ==========================================
# API ĐĂNG NHẬP BẰNG GOOGLE
# ==========================================
@app.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.json
    access_token = data.get('token')

    if not access_token:
        return jsonify({'message': 'Thiếu token xác thực!'}), 400

    try:
        google_response = requests.get(f'https://www.googleapis.com/oauth2/v3/userinfo?access_token={access_token}')
        google_data = google_response.json()

        if 'error' in google_data:
            return jsonify({'message': 'Token Google không hợp lệ!'}), 401

        email = google_data.get('email')
        ten_kh = google_data.get('name')

        user = KhachHang.query.filter_by(Email=email).first()

        if not user:
            user = KhachHang(
                TenKH=ten_kh,
                Email=email,
                MatKhau="",
                SdtKH="Chưa cập nhật",
                CCCD_Passport="CCCD_" + str(int(datetime.utcnow().timestamp()))
            )
            db.session.add(user)
            db.session.commit()

        return jsonify({
            'message': 'Đăng nhập Google thành công',
            'user': {
                'id': user.MaKhachHang,
                'ten_kh': user.TenKH,
                'email': user.Email,
                'picture': google_data.get('picture')
            }
        }), 200

    except Exception as e:
        return jsonify({'message': f'Lỗi server: {str(e)}'}), 500

# API CHATBOT TƯ VẤN KHÁCH SẠN
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "Tin nhắn không được để trống"}), 400

    try:
        # Lấy danh sách phòng ĐANG TRỐNG từ Database để "mớm" thông tin cho AI
        phong_trong = Phong.query.filter_by(TrangThaiPhong="Trống").all()
        thong_tin_phong = "Danh sách phòng đang trống hiện tại:\n"
        
        if phong_trong:
            for p in phong_trong:
                thong_tin_phong += f"- {p.TenPhong} (Loại: {p.LoaiPhong}), Giá: ${p.DonGia:.2f} USD/đêm.\n"
        else:
            thong_tin_phong = "Hiện tại khách sạn đã hết phòng trống.\n"

        # Thiết lập System Prompt (Bối cảnh cho AI)
        system_instruction = f"""
        Bạn là Miranda Assistant, lễ tân AI chính thức của Hotel Miranda.

        NHIỆM VỤ CHÍNH:
        - Tư vấn đặt phòng và dịch vụ khách sạn bằng tiếng Việt tự nhiên.
        - Ưu tiên giúp khách ra quyết định nhanh: chọn phòng, giá, bước đặt phòng.

        PHẠM VI HỖ TRỢ:
        - Trong phạm vi khách sạn: phòng, giá, tình trạng phòng, gợi ý đặt phòng.
        - Ngoài phạm vi khách sạn: trả lời rất ngắn, sau đó dẫn lại chủ đề đặt phòng.

        QUY TẮC DỮ LIỆU (BẮT BUỘC):
        - Chỉ sử dụng dữ liệu hệ thống bên dưới cho thông tin phòng và giá.
        - Không bịa thông tin, không tự suy đoán số liệu, không tự thêm hạng phòng.
        - Nếu thiếu dữ liệu, phải nói đúng câu: "Hiện chưa có thông tin chính xác trong hệ thống".

        QUY ƯỚC GIÁ:
        - Luôn hiển thị giá bằng USD.
        - Không dùng VND hoặc đơn vị tiền tệ khác.
        - Khi nhắc giá phòng, dùng định dạng rõ ràng: "$... USD/đêm".

        PHONG CÁCH TRẢ LỜI:
        - Lịch sự, thân thiện, rõ ràng, ngắn gọn.
        - Tối đa 8 dòng, tránh đoạn văn dài.
        - Dùng gạch đầu dòng khi liệt kê lựa chọn.

        CẤU TRÚC ƯU TIÊN CHO MỖI CÂU TRẢ LỜI:
        1. Tình trạng phòng hiện tại (còn/hết và loại phù hợp nếu có).
        2. Gợi ý 1-2 lựa chọn tốt nhất theo nhu cầu khách.
        3. Bước tiếp theo rõ ràng để khách đặt phòng ngay.

        XỬ LÝ THEO NGỮ CẢNH:
        - Nếu khách nêu ngân sách: ưu tiên gợi ý phòng có giá gần/không vượt ngân sách.
        - Nếu khách nêu số người hoặc loại phòng: lọc gợi ý theo thông tin đó.
        - Nếu khách hỏi mơ hồ: hỏi lại 1 câu ngắn để làm rõ (ngày ở, số người, ngân sách).
        - Nếu khách muốn đặt ngay: hướng dẫn vào form booking và chuẩn bị check-in/check-out.

        DỮ LIỆU HỆ THỐNG:
        {thong_tin_phong}
        """

        # Ghép bối cảnh và câu hỏi của khách
        prompt = f"{system_instruction}\n\nKhách hàng: {user_message}\nLễ tân:"
        
        # Gọi Gemini 2.5 Flash
        response = model.generate_content(prompt)

        return jsonify({"reply": response.text}), 200

    except Exception as e:
        return jsonify({"error": f"Lỗi xử lý AI: {str(e)}"}), 500
if __name__ == '__main__':
    app.run(debug=True)