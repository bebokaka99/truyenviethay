export function initHeader() {
    fetch('/truyenviethay/api/api.php?action=user')
        .then(res => res.json())
        .then(data => {
            const userInfo = document.getElementById('user-info');
            const loginLink = document.getElementById('login-link');
            const registerLink = document.getElementById('register-link');
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            if (data.loggedIn) {
                userInfo.style.display = 'block';
                document.getElementById('user-avatar').src = data.avatar;
                if (loginLink) loginLink.style.display = 'none';
                if (registerLink) registerLink.style.display = 'none';
                if (loginBtn) loginBtn.style.display = 'none';
                if (registerBtn) registerBtn.style.display = 'none';
            } else {
                userInfo.style.display = 'none';
                if (loginLink) loginLink.style.display = 'block';
                if (registerLink) registerLink.style.display = 'block';
                if (loginBtn) loginBtn.style.display = 'inline-block';
                if (registerBtn) registerBtn.style.display = 'inline-block';
            }
        })
        .catch(error => {
            console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
        });

    fetch('/truyenviethay/api/api.php?action=theloai&subaction=categories')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('theloai-container');
            if (data.success && data.data.length > 0) {
                container.innerHTML = data.data.map(theloai => `
                    <a href="truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>
                `).join('') + '<a href="truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>';
            } else {
                container.innerHTML = '<p>Chưa có thể loại nào.</p>';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải thể loại:', error);
            const container = document.getElementById('theloai-container');
            container.innerHTML = '<p>Lỗi khi tải thể loại. Vui lòng thử lại.</p>';
        });

    const menuBtn = document.querySelector('.nut-menu');
    const nav = document.querySelector('.thanh-dieu-huong');
    const theloaiToggle = document.getElementById('theloai-toggle');
    const theloaiDropdown = document.getElementById('theloai-dropdown');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => nav.classList.toggle('active'));
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) nav.classList.remove('active');
        });
    }

    if (theloaiToggle && theloaiDropdown) {
        theloaiToggle.addEventListener('click', (e) => {
            e.preventDefault();
            theloaiDropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!theloaiToggle.contains(e.target) && !theloaiDropdown.contains(e.target)) theloaiDropdown.classList.remove('active');
        });
    }
}