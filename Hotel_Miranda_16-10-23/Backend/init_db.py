from app import app
from models import db, Phong, ThucDon

with app.app_context():
    db.drop_all()
    db.create_all()

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

    db.session.add_all([mon1, mon2, mon3, mon4, mon5, mon6])
    db.session.add(phong1)
    db.session.add(phong2)
    db.session.add(phong3)
    db.session.commit()
    print("Đã cập nhật dữ liệu Phòng và Thực đơn thành công!")