from app import app
from models import db, Phong, HoaDon_Phong, HoaDon_DichVu, HoaDon

def reinit_rooms():
    with app.app_context():
        print("--- Đang dọn dẹp toàn bộ dữ liệu phòng và hóa đơn ---")
        try:
            # 1. Xóa các bảng liên quan đến hóa đơn trước (tránh lỗi khóa ngoại)
            db.session.query(HoaDon_Phong).delete()
            db.session.query(HoaDon_DichVu).delete()
            db.session.query(HoaDon).delete()
            
            # 2. Xóa sạch bảng Phòng
            db.session.query(Phong).delete()
            print("✅ Đã xóa sạch dữ liệu cũ.")

            # 3. Danh sách 15 phòng mới (chia đều các loại phòng)
            # RoomTypes: Standard ($100), Deluxe ($200), Family ($350)
            new_rooms = []
            
            # Tạo 5 phòng Standard (101 - 105)
            for i in range(1, 6):
                new_rooms.append(Phong(MaPhong=f"10{i}", LoaiPhong="Standard", GiaPhong=100, TrangThaiPhong="Trống"))
            
            # Tạo 5 phòng Deluxe (201 - 205)
            for i in range(1, 6):
                new_rooms.append(Phong(MaPhong=f"20{i}", LoaiPhong="Deluxe", GiaPhong=200, TrangThaiPhong="Trống"))
                
            # Tạo 5 phòng Family (301 - 305)
            for i in range(1, 6):
                new_rooms.append(Phong(MaPhong=f"30{i}", LoaiPhong="Family", GiaPhong=350, TrangThaiPhong="Trống"))

            db.session.add_all(new_rooms)
            db.session.commit()
            print(f"✅ Đã thêm mới thành công {len(new_rooms)} phòng vào Database.")
            print("--- HOÀN TẤT ---")

        except Exception as e:
            db.session.rollback()
            print(f"❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    reinit_rooms()