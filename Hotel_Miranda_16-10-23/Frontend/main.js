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
      
      // CHỈNH SỬA Ở ĐÂY: Cắt mảng chỉ lấy 6 phần tử đầu tiên (từ vị trí 0 đến 6)
      const top6Rooms = rooms.slice(0, 6);
      
      // Duyệt qua đúng 6 phòng và tạo mã HTML
      top6Rooms.forEach(room => {
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

async function loadNews() {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/tintuc');
    const newsItems = await response.json();
    const newsGrid = document.getElementById('news-grid');

    if (newsGrid) {
      newsGrid.innerHTML = ''; 
      
      newsItems.forEach(item => {
        const card = `
          <div class="news__card">
            <img src="${item.HinhAnh}" alt="news" />
            <div class="news__card__title">
              <p>${item.NgayDang}</p>
              <p>${item.TacGia}</p>
            </div>
            <h4>${item.TieuDe}</h4>
            <p>${item.NoiDung}</p>
          </div>
        `;
        newsGrid.innerHTML += card;
      });

      // Kích hoạt lại hiệu ứng cuộn cho bài viết
      ScrollReveal().reveal(".news__card", {
        ...scrollRevealOption,
        interval: 500,
      });
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu tin tức:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const loginLinkItem = document.querySelector('.login-btn').parentElement;

  if (currentUser) {
      // Lấy ảnh từ Google hoặc dùng ảnh mặc định nếu không có
      const userAvatar = currentUser.picture || 'assets/default-avatar.png'; 
      
      loginLinkItem.innerHTML = `
          <div class="user-profile-container">
              <div class="avatar-wrapper" title="${currentUser.ten_kh}">
                  <img src="${userAvatar}" alt="Avatar" class="user-avatar" id="avatarClick">
              </div>
              <button onclick="handleLogout()" class="logout-icon-btn" title="Đăng xuất">
                  <i class="ri-logout-box-r-line"></i>
              </button>
          </div>
      `;
  }
});

// Hàm Đăng xuất
function handleLogout() {
  localStorage.removeItem('currentUser'); // Xóa dữ liệu user
  window.location.reload(); // Tải lại trang để hiện lại nút Login
}

function loadMap() {
  // Thay bằng Access Token của bạn
  

  const hotelCoords = [104.9833, 22.8167]; // Tọa độ Hotel Miranda

  // 1. Khởi tạo bản đồ
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: hotelCoords,
      zoom: 14
  });

  // 2. Thêm Marker cho khách sạn
  new mapboxgl.Marker({ color: '#f3a446' })
      .setLngLat(hotelCoords)
      .setPopup(new mapboxgl.Popup({ offset: 25 })
      .setHTML('<h3>Hotel Miranda</h3><p>Đích đến của bạn</p>'))
      .addTo(map);

  // 3. Tích hợp bộ chỉ đường (Directions)
  const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric', // Sử dụng đơn vị mét/km
      profile: 'mapbox/driving', // Chế độ mặc định: lái xe (có thể đổi thành 'mapbox/walking', 'mapbox/cycling')
      alternatives: true,
      placeholderOrigin: 'Nhập điểm khởi hành hoặc chọn trên bản đồ',
      placeholderDestination: 'Hotel Miranda',
      interactive: false // Khóa điểm đến là khách sạn, người dùng chỉ nhập điểm đi
  });

  // Thêm bảng điều khiển chỉ đường vào góc trái trên
  map.addControl(directions, 'top-left');

  // Tự động thiết lập điểm đến cố định là Khách sạn
  map.on('load', () => {
      directions.setDestination(hotelCoords);
  });

  // 4. Thêm nút định vị GPS người dùng ở góc phải dưới
  map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
  }), 'bottom-right');
}

const bookingForm = document.querySelector(".booking__container form");

if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault(); 

        // 1. Lấy ngày khách muốn đặt
        const checkIn = document.getElementById("check_in").value;
        const checkOut = document.getElementById("check_out").value;

        // 2. Chuyển sang trang mới (booking.html) và gắn dữ liệu lên thanh địa chỉ
        // Ví dụ link sẽ thành: booking.html?check_in=2026-04-10&check_out=2026-04-12
        window.location.href = `Booking/index.html?check_in=${checkIn}&check_out=${checkOut}`;
    });
}

// Tính năng: Khóa ngày quá khứ cho Form Đặt phòng
const checkInInput = document.getElementById("check_in");
const checkOutInput = document.getElementById("check_out");

if (checkInInput && checkOutInput) {
    // Lấy ngày hôm nay theo chuẩn YYYY-MM-DD của múi giờ hiện tại
    const today = new Date();
    // Trừ đi timezone offset để tránh lỗi lệch ngày
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    // Gán ngày nhỏ nhất có thể chọn là hôm nay
    checkInInput.setAttribute("min", localToday);
    checkOutInput.setAttribute("min", localToday);

    // Tính năng Nâng cao: Khi khách chọn Ngày Đến, Ngày Đi bắt buộc phải LỚN HƠN Ngày Đến ít nhất 1 ngày
    checkInInput.addEventListener("change", function() {
        if (this.value) {
            const checkInDate = new Date(this.value);
            checkInDate.setDate(checkInDate.getDate() + 1); // Cộng thêm 1 ngày
            
            const nextDay = new Date(checkInDate.getTime() - (checkInDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            
            // Ép Ngày Đi phải từ "nextDay" trở đi
            checkOutInput.setAttribute("min", nextDay);
            
            // Nếu khách đã lỡ chọn Ngày Đi bé hơn quy định mới, tự động reset ô Ngày Đi
            if (checkOutInput.value && checkOutInput.value < nextDay) {
                checkOutInput.value = nextDay;
            }
        }
    });
}

// --- LOGIC NÚT BACK TO TOP ---
const backToTopBtn = document.getElementById("backToTopBtn");

// Bắt sự kiện khi người dùng cuộn chuột
window.addEventListener("scroll", () => {
    // Nếu cuộn xuống quá 300px thì hiện nút, ngược lại thì ẩn
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});

// Bắt sự kiện khi bấm vào nút
backToTopBtn.addEventListener("click", () => {
    // Cuộn lên vị trí 0 mượt mà (smooth)
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
// CHATBOT
//chatbotjs

function initChatbot() {
  const toggleBtn = document.getElementById("chatbot-toggle");
  const panel = document.getElementById("chatbot-panel");
  const closeBtn = document.getElementById("chatbot-close");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const messages = document.getElementById("chatbot-messages");

  if (!toggleBtn || !panel || !closeBtn || !form || !input || !messages) {
    return;
  }

  const endpoints = [
    "http://127.0.0.1:5000/api/chat",
    "http://127.0.0.1:5000/api/chatbot",
  ];

  const appendMessage = (role, text, extraClass = "") => {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg ${role} ${extraClass}`.trim();
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  const askApi = async (message) => {
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.message || "API error");
        }

        return data.reply || data.message || "Xin lỗi, tôi chưa có câu trả lời.";
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Không thể kết nối được chatbot API.");
  };

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      input.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();

    if (!message) {
      return;
    }

    appendMessage("user", message);
    input.value = "";
    input.disabled = true;

    const typing = appendMessage("bot", "Đang trả lời...", "typing");

    try {
      const reply = await askApi(message);
      typing.remove();
      appendMessage("bot", reply);
    } catch (error) {
      typing.remove();
      appendMessage("bot", `Loi: ${error.message}`);
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  appendMessage("bot", "Xin chào, tôi là Miranda Assistant. Bạn cần hỗ trợ gì về khách sạn?");
}

// Chạy hàm này ngay khi trang web vừa load xong
document.addEventListener("DOMContentLoaded", () => {
  // Khoi tao chatbot truoc de tranh bi anh huong boi loi cac module khac
  initChatbot();
  loadRooms();
  loadMenu();
  loadNews();

  try {
    loadMap();
  } catch (error) {
    console.error("Mapbox loi, bo qua map de cac tinh nang khac van chay:", error);
  }
});