from app import app
from models import db, Phong

def tao_nhieu_phong():
    with app.app_context():
        # Định nghĩa 3 loại phòng cơ bản
        danh_muc_loai_phong = [
            {"loai": "Deluxe", "gia": 299.0, "hinh": "assets/room-1.jpg", "mota": "Phòng Deluxe sang trọng với ban công view biển tuyệt đẹp.", "suc_chua": 2},
            {"loai": "Family", "gia": 450.0, "hinh": "assets/room-2.jpg", "mota": "Phòng Gia đình siêu rộng, 2 giường đôi, không gian ấm cúng.", "suc_chua": 4},
            {"loai": "Standard", "gia": 150.0, "hinh": "assets/room-3.jpg", "mota": "Phòng Tiêu chuẩn thiết kế tối giản, đầy đủ tiện nghi.", "suc_chua": 2}
        ]

        so_luong_da_them = 0

        # Tự động tạo phòng cho các tầng 3, 4, 5. Mỗi tầng 5 phòng.
        for tang in range(3, 6):
            for so_phong in range(1, 6):
                ma_phong = f"P{tang}0{so_phong}" # Sẽ tạo ra: P301, P302... P505
                
                # Kiểm tra xem mã phòng này đã có trong Database chưa, nếu chưa mới thêm
                phong_da_ton_tai = Phong.query.filter_by(MaPhong=ma_phong).first()
                if not phong_da_ton_tai:
                    # Lấy luân phiên các loại phòng (Deluxe -> Family -> Standard)
                    info = danh_muc_loai_phong[(tang + so_phong) % 3]
                    
                    phong_moi = Phong(
                        MaPhong=ma_phong,
                        TenPhong=f"{info['loai']} Room {ma_phong}",
                        LoaiPhong=info['loai'],
                        TrangThaiPhong="Trống",
                        DonGia=info['gia'],
                        SucChua=info['suc_chua'],
                        MoTa=info['mota'],
                        HinhAnh=info['hinh']
                    )
                    db.session.add(phong_moi)
                    so_luong_da_them += 1

        db.session.commit()
        print(f"🎉 Đã thêm thành công {so_luong_da_them} phòng trống mới vào Database!")

if __name__ == "__main__":
    tao_nhieu_phong()