import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Phong, ThucDon

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'hotel_miranda.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

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
if __name__ == '__main__':
    app.run(debug=True)