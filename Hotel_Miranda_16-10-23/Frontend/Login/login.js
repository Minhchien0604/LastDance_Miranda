// State
let currentMode = 'login';

// Elements
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const tabIndicator = document.getElementById('tabIndicator');
const nameField = document.getElementById('nameField');
const confirmPasswordField = document.getElementById('confirmPasswordField');
const loginExtras = document.getElementById('loginExtras');
const submitBtn = document.getElementById('submitBtn');
const authForm = document.getElementById('authForm');
const glassCard = document.getElementById('glassCard');

// Switch Tab Function
function switchTab(mode) {
    currentMode = mode;
    
    if (mode === 'login') {
        // Update UI for Login
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        tabIndicator.style.transform = 'translateX(0)';
        
        // Hide register fields
        nameField.classList.add('hidden');
        confirmPasswordField.classList.add('hidden');
        loginExtras.style.display = 'flex';
        
        // Update button
        submitBtn.querySelector('.btn-text').textContent = 'Đăng Nhập';
        
        // Remove required attributes
        document.getElementById('name').removeAttribute('required');
        document.getElementById('confirmPassword').removeAttribute('required');
        
    } else {
        // Update UI for Register
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        tabIndicator.style.transform = 'translateX(100%)';
        
        // Show register fields
        setTimeout(() => {
            nameField.classList.remove('hidden');
            confirmPasswordField.classList.remove('hidden');
        }, 150);
        loginExtras.style.display = 'none';
        
        // Update button
        submitBtn.querySelector('.btn-text').textContent = 'Đăng Ký';
        
        // Add required attributes
        document.getElementById('name').setAttribute('required', 'required');
        document.getElementById('confirmPassword').setAttribute('required', 'required');
    }
    
    // Reset form
    authForm.reset();
    
    // Add animation
    glassCard.style.animation = 'none';
    setTimeout(() => {
        glassCard.style.animation = '';
    }, 10);
}

// Form Submit Handler
authForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (currentMode === 'login') {
        // --- LOGIC ĐĂNG NHẬP THƯỜNG ---
        try {
            submitBtn.querySelector('.btn-text').textContent = 'Đang xử lý...';

            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    mat_khau: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessMessage(`Đăng nhập thành công!\nChào mừng ${data.user.ten_kh}`);
                
                const rememberMe = document.getElementById('rememberMe').checked;
                if (rememberMe) {
                    localStorage.setItem('savedEmail', email);
                }
                
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Lưu thông tin admin nếu đăng nhập admin
                if (data.user.is_admin) {
                    localStorage.setItem('isAdmin', 'true');
                    localStorage.setItem('adminData', JSON.stringify(data.user));
                } else {
                    localStorage.removeItem('isAdmin');
                    localStorage.removeItem('adminData');
                }
                
                setTimeout(() => {
                    // Nếu user là admin, chuyển hướng sang trang admin
                    if (data.user.is_admin) {
                        window.location.href = '../Admin/index.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 1500);

            } else {
                showErrorMessage(data.message || 'Đăng nhập thất bại!');
                submitBtn.querySelector('.btn-text').textContent = 'Đăng Nhập';
            }
        } catch (error) {
            console.error('Lỗi kết nối:', error);
            showErrorMessage('Không thể kết nối đến máy chủ Backend!');
            submitBtn.querySelector('.btn-text').textContent = 'Đăng Nhập';
        }
        
    } else {
        // --- LOGIC ĐĂNG KÝ ---
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showErrorMessage('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (password.length < 6) {
            showErrorMessage('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        try {
            submitBtn.querySelector('.btn-text').textContent = 'Đang xử lý...';

            const response = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ten_kh: name,
                    email: email,
                    mat_khau: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessMessage(`Chào mừng ${name}!\nTài khoản đã được tạo thành công!`);
                
                setTimeout(() => {
                    switchTab('login');
                    document.getElementById('email').value = email;
                    document.getElementById('password').value = ''; 
                    document.getElementById('confirmPassword').value = '';
                }, 2000);
            } else {
                showErrorMessage(data.message || 'Email này đã được sử dụng!');
                submitBtn.querySelector('.btn-text').textContent = 'Đăng Ký';
            }
        } catch (error) {
            console.error('Lỗi kết nối:', error);
            showErrorMessage('Không thể kết nối đến máy chủ Backend!');
            submitBtn.querySelector('.btn-text').textContent = 'Đăng Ký';
        }
    }
});

// Social Login Handler (Cho Facebook, Apple)
function handleSocialLogin(platform) {
    if (platform === 'Google') return; // Bỏ qua Google vì đã xử lý riêng
    console.log(`Đăng nhập bằng ${platform}`);
    showSuccessMessage(`Tính năng đăng nhập ${platform} đang được phát triển...`);
}

// Forgot Password Handler
function handleForgotPassword() {
    const email = document.getElementById('email').value;
    
    if (email) {
        showSuccessMessage(`Link đặt lại mật khẩu đã được gửi đến:\n${email}`);
        console.log('Reset password for:', email);
    } else {
        const userEmail = prompt('Vui lòng nhập email của bạn:');
        if (userEmail && validateEmail(userEmail)) {
            showSuccessMessage(`Link đặt lại mật khẩu đã được gửi đến:\n${userEmail}`);
            console.log('Reset password for:', userEmail);
        } else if (userEmail) {
            showErrorMessage('Email không hợp lệ!');
        }
    }
}

// Toggle Password Visibility
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        button.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        field.type = 'password';
        button.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Validation Helpers
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Real-time Email Validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value;
    if (email && !validateEmail(email)) {
        this.style.borderColor = 'rgba(239, 68, 68, 0.8)';
        this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        this.style.boxShadow = 'none';
    }
});

// Real-time Password Match Validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = 'rgba(239, 68, 68, 0.8)';
        this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        this.style.boxShadow = 'none';
    }
});

// Messages
function showSuccessMessage(message) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showErrorMessage(message) {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        white-space: pre-line;
        max-width: 300px;
    `;
    notification.textContent = message;
    notification.classList.add('notification');
    
    return notification;
}

// Add CSS for notification show class
const style = document.createElement('style');
style.textContent = `
    .notification.show {
        transform: translateX(0) !important;
    }
`;
document.head.appendChild(style);

// Auto-fill saved email on load
window.addEventListener('load', function() {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Add floating effect to glass card
let mouseX = 0;
let mouseY = 0;
let cardX = 0;
let cardY = 0;

document.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

function animateCard() {
    cardX += (mouseX * 10 - cardX) * 0.1;
    cardY += (mouseY * 10 - cardY) * 0.1;
    
    if (window.innerWidth > 768) {
        glassCard.style.transform = `
            perspective(1000px)
            rotateY(${cardX}deg)
            rotateX(${-cardY}deg)
        `;
    }
    
    requestAnimationFrame(animateCard);
}

animateCard();


// ==========================================
// XỬ LÝ ĐĂNG NHẬP GOOGLE BẰNG NÚT CUSTOM
// ==========================================
let googleClient;

document.addEventListener('DOMContentLoaded', () => {
    googleClient = google.accounts.oauth2.initTokenClient({
        client_id: "820504542039-29mm46n9s40uh7jjo3d8176i7f6didkl.apps.googleusercontent.com",
        scope: "email profile",
        callback: handleGoogleLoginResponse
    });

    const customGoogleBtn = document.getElementById('custom-google-btn');
    if (customGoogleBtn) {
        customGoogleBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            googleClient.requestAccessToken(); 
        });
    }
});

async function handleGoogleLoginResponse(response) {
    if (response && response.access_token) {
        console.log("Access Token lấy được:", response.access_token);
        showSuccessMessage("Đang xác thực với máy chủ...\nVui lòng đợi.");

        try {
            const res = await fetch('http://127.0.0.1:5000/api/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.access_token })
            });

            const data = await res.json();

            if (res.ok) {
                showSuccessMessage(`Đăng nhập thành công!\nChào mừng ${data.user.ten_kh}`);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                showErrorMessage(data.message || 'Đăng nhập Google thất bại!');
            }
        } catch (error) {
            console.error('Lỗi kết nối Backend:', error);
            showErrorMessage('Không thể kết nối đến máy chủ Backend!');
        }
    }
}

// Initialize
console.log('Hotel Luxury Login System - Glassmorphism Style');
console.log('Current mode:', currentMode);