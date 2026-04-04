import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Phong, ThucDon, TinTuc, HoaDon, HoaDon_Phong, KhachHang 
from datetime import datetime
import requests
from werkzeug.security import generate_password_hash, check_password_hash # Thêm thư viện băm mật khẩu

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'hotel_miranda.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
# CÁC API XÁC THỰC (AUTH)
# ==========================================
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
                'email': user.Email
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
@app.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.json
    access_token = data.get('token')

    if not access_token:
        return jsonify({'message': 'Thiếu token xác thực!'}), 400

    try:
        # 1. Mang Access Token lên Google API để đổi lấy thông tin user (Email, Tên)
        google_response = requests.get(f'https://www.googleapis.com/oauth2/v3/userinfo?access_token={access_token}')
        google_data = google_response.json()

        # Nếu Google trả về lỗi (token hết hạn, fake...)
        if 'error' in google_data:
            return jsonify({'message': 'Token Google không hợp lệ!'}), 401

        email = google_data.get('email')
        ten_kh = google_data.get('name')

        # 2. Kiểm tra xem Email này đã có trong Database của khách sạn chưa
        user = KhachHang.query.filter_by(Email=email).first()

        if not user:
            # 3. Nếu khách lần đầu đến, tự động đăng ký tài khoản cho họ
            user = KhachHang(
                TenKH=ten_kh,
                Email=email,
                MatKhau="", # Đăng nhập Google thì không cần mật khẩu
                SdtKH="Chưa cập nhật",
                CCCD_Passport="CCCD_" + str(int(datetime.utcnow().timestamp()))
            )
            db.session.add(user)
            db.session.commit()

        # 4. Trả kết quả thành công về cho Frontend
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
if __name__ == '__main__':
    app.run(debug=True)