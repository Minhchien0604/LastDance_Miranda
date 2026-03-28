const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// header container
ScrollReveal().reveal(".header__container .section__subheader", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".header__container h1", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".header__container .btn", {
  ...scrollRevealOption,
  delay: 1000,
});

// feature container
ScrollReveal().reveal(".feature__card", {
  ...scrollRevealOption,
  interval: 500,
});

// news container
ScrollReveal().reveal(".news__card", {
  ...scrollRevealOption,
  interval: 500,
});

// Hàm gọi API và hiển thị phòng
async function loadRooms() {
  try {
    // Gọi API từ Flask (nhớ kiểm tra port Flask của bạn là 5000 hay port khác)
    const response = await fetch('http://127.0.0.1:5000/api/phong');
    const rooms = await response.json();
    const roomGrid = document.getElementById('room-grid');

    if (roomGrid) {
      roomGrid.innerHTML = ''; // Xóa nội dung rỗng ban đầu
      
      // Duyệt qua từng phòng và tạo mã HTML
      rooms.forEach(room => {
        const roomCard = `
          <div class="room__card">
            <img src="${room.HinhAnh}" alt="room" />
            <div class="room__card__details">
              <div>
                <h4>${room.TenPhong}</h4>
                <p>${room.MoTa || 'Mô tả đang cập nhật...'}</p>
              </div>
              <h3>$${room.DonGia}<span>/night</span></h3>
            </div>
          </div>
        `;
        roomGrid.innerHTML += roomCard; // Nhét vào màn hình
      });

      // Kích hoạt lại hiệu ứng cuộn cho các thẻ vừa tạo
      ScrollReveal().reveal(".room__card", {
        ...scrollRevealOption,
        interval: 500,
      });
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu phòng:", error);
  }
}
// Hàm gọi API và hiển thị thực đơn
async function loadMenu() {
    try{
      const response = await fetch('http://127.0.0.1:5000/api/thucdon');
      const menuItems = await response.json();
      const menuList = document.getElementById('menu-list');

      if (menuList){
        menuList.innerHTML = '';
        menuItems.forEach(item => {
          const li = `
            <li>
              <img src="${item.HinhAnh}" alt="menu" />
              <div class="menu__details">
                <h4>${item.TenMon}</h4>
                <p>${item.MoTa}</p>
              </div>
            </li>
          `;
          menuList.innerHTML += li; 
        });
      }
    }
    catch (error){
      console.error("Lỗi khi tải dữ liệu thực đơn:", error);
    }
}
// Chạy hàm này ngay khi trang web vừa load xong
document.addEventListener("DOMContentLoaded", () => {
  loadRooms();
  loadMenu(); // Thêm dòng này để tải thực đơn
});