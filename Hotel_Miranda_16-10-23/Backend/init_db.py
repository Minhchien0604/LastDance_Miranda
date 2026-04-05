from app import app
from models import db, Phong, ThucDon, TinTuc, KhachHang
from werkzeug.security import generate_password_hash

with app.app_context():
    db.drop_all()
    db.create_all()

    # ===== TẠO TÀI KHOẢN ADMIN =====
    admin = KhachHang(
        TenKH="Admin",
        Email="admin@hotel.com",
        MatKhau=generate_password_hash("admin123"),
        SdtKH="0123456789",
        CCCD_Passport="ADMIN_001",
        IsAdmin=True
    )
    db.session.add(admin)

    phong1 = Phong(
        MaPhong="P01",
        TenPhong="Deluxe Suite",
        LoaiPhong="Deluxe",
        DonGia=399.0,
        HinhAnh="assets/room-1.jpg"
    )
    phong2 = Phong(
        MaPhong="P02",
        TenPhong="Family Suite",
        LoaiPhong="Family",
        DonGia=599.0,
        HinhAnh="assets/room-2.jpg"
    )
    phong3 = Phong(
        MaPhong="P03",
        TenPhong="Standard Room",
        LoaiPhong="Standard",
        DonGia=199.0,
        HinhAnh="assets/room-3.jpg"
    )
    
    mon1 = ThucDon(
        TenMon="Fggs & Bacon",
        MoTa="It is a culinary innovation that puts a unique spin on the beloved breakfast combination.",
        HinhAnh="assets/menu-1.jpg"
    )
    mon2 = ThucDon(
        TenMon="Tea or Coffee",
        MoTa="A classic choice for your daily dose of comfort and calmness.",
        HinhAnh="assets/menu-2.jpg"
    )
    mon3 = ThucDon(
        TenMon="Chia Oatmeal",
        MoTa="Our Chia Oatmeal is a wholesome nutrient-packed breakfast delight.",
        HinhAnh="assets/menu-3.jpg"
    )
    mon4 = ThucDon(
        TenMon="Fruit Parfait",
        MoTa="Our Fruit Parfait is a delightful culinary masterpiece of freshness and flavor.",
        HinhAnh="assets/menu-4.jpg"
    )
    mon5 = ThucDon(
        TenMon="Marmalade Selection",
        MoTa="Our Marmalade Selection is a delectable medley of vibrant, handcrafted citrus preserves.",
        HinhAnh="assets/menu-5.jpg"
    )
    mon6 = ThucDon(
        TenMon="Cheese Plate",
        MoTa="Our cheese plate is a masterpiece that celebrates rich and diverse world of cheeses.",
        HinhAnh="assets/menu-6.jpg"
    )

    tin1 = TinTuc(
        TieuDe="Exploring Local Culinary Gems: A Foodie's Guide.",
        NoiDung="Join Emily as she takes you on a gastronomic adventure through the neighborhood surrounding our hotel.",
        NgayDang="25th March 2022",
        TacGia="By Emily",
        HinhAnh="assets/news-1.jpg"
    )
    tin2 = TinTuc(
        TieuDe="Balancing Mind, Body, and Soul at Our Hotel.",
        NoiDung="Discover holistic spa treatments, fitness facilities, and mindfulness practices that will leave you feeling refreshed.",
        NgayDang="15th June 2022",
        TacGia="By David",
        HinhAnh="assets/news-2.jpg"
    )
    tin3 = TinTuc(
        TieuDe="Exploring Outdoor Activities Near Our Hotel.",
        NoiDung="From hiking and biking trails to water sports and wildlife encounters, she highlights ways to experience nature's wonders.",
        NgayDang="08th August 2022",
        TacGia="By Sarah",
        HinhAnh="assets/news-3.jpg"
    )

    db.session.add_all([tin1, tin2, tin3])
    db.session.add_all([mon1, mon2, mon3, mon4, mon5, mon6])
    db.session.add(phong1)
    db.session.add(phong2)
    db.session.add(phong3)
    db.session.commit()
    print("✅ Đã cập nhật dữ liệu thành công!")
    print("=" * 50)
    print("📝 TÀI KHOẢN ADMIN:")
    print(f"   Email: admin@hotel.com")
    print(f"   Mật khẩu: admin123")
    print("=" * 50)
    print("✅ Dữ liệu bao gồm:")
    print("   - 3 Phòng (Standard, Deluxe, Family)")
    print("   - 6 Món ăn")
    print("   - 3 Tin tức")
    print("   - 1 Tài khoản admin")