export function initChiTietChuong() {
    // Chờ DOM tải xong
    document.addEventListener('DOMContentLoaded', () => {
        // Xử lý header (ẩn nút Đăng nhập/Đăng ký, hiển thị user info)
        fetch('/truyenviethay/api/api.php?action=profile')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!data.success) {
                    window.location.href = data.redirect || '/truyenviethay/users/login.html';
                    return;
                }
                const loginLink = document.getElementById('login-link');
                const registerLink = document.getElementById('register-link');
                const loginBtn = document.getElementById('login-btn');
                const registerBtn = document.getElementById('register-btn');
                const userInfo = document.getElementById('user-info');
                const userAvatar = document.getElementById('user-avatar');

                if (loginLink) loginLink.style.display = 'none';
                if (registerLink) registerLink.style.display = 'none';
                if (loginBtn) loginBtn.style.display = 'none';
                if (registerBtn) registerBtn.style.display = 'none';
                if (userInfo) userInfo.style.display = 'block';
                if (userAvatar && data.data.avatar) userAvatar.src = '../' + data.data.avatar;
            })
            .catch(error => {
                console.error('Lỗi khi tải thông tin người dùng:', error);
                const container = document.querySelector('.chi-tiet-chuong-container');
                if (container) container.innerHTML = `<p>Lỗi khi tải thông tin người dùng: ${error.message}. Vui lòng thử lại.</p>`;
            });

        // Tải danh sách thể loại cho dropdown
        fetch('/truyenviethay/api/api.php?action=theloai&subaction=categories')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const theloaiContainer = document.getElementById('theloai-container');
                if (theloaiContainer && data.success && data.data.length > 0) {
                    data.data.forEach(theloai => {
                        theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
                    });
                    theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
                } else if (theloaiContainer) {
                    theloaiContainer.innerHTML = '<p>Chưa có thể loại nào.</p>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải thể loại:', error);
                const theloaiContainer = document.getElementById('theloai-container');
                if (theloaiContainer) theloaiContainer.innerHTML = `<p>Lỗi khi tải thể loại: ${error.message}. Vui lòng thử lại.</p>`;
            });

        // Lấy tham số từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const truyenId = urlParams.get('truyen_id');
        const chapterId = urlParams.get('chapter_id');

        if (!truyenId || !chapterId) {
            const container = document.querySelector('.chi-tiet-chuong-container');
            if (container) container.innerHTML = '<p>ID không hợp lệ.</p>';
            return;
        }

        // Tải chi tiết chương từ API
        fetch(`/truyenviethay/api/chi-tiet-chuong.php?truyen_id=${truyenId}&chapter_id=${chapterId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!data.success) {
                    const container = document.querySelector('.chi-tiet-chuong-container');
                    if (container) container.innerHTML = `<p>${data.error}</p>`;
                    return;
                }

                const chapter = data.chapter;
                const chapterTitle = document.getElementById('chapter-title');
                const details = document.getElementById('chapter-details');
                if (chapterTitle) chapterTitle.textContent = `CHI TIẾT CHƯƠNG - ${data.ten_truyen}`;
                const trangThai = chapter.trang_thai === 'cho_duyet' ? '<span style="color: orange;">Chờ duyệt</span>' :
                                 chapter.trang_thai === 'da_duyet' ? '<span style="color: green;">Đã duyệt</span>' :
                                 `<span style="color: red;">Từ chối${chapter.ly_do_tu_choi ? ` (Lý do: ${chapter.ly_do_tu_choi})` : ''}</span>`;

                if (details) details.innerHTML = `
                    <h3>Chương ${chapter.so_chuong}: ${chapter.tieu_de}</h3>
                    <p><strong>Ngày đăng:</strong> ${chapter.thoi_gian_dang}</p>
                    <p><strong>Lượt xem:</strong> ${chapter.luot_xem}</p>
                    <p><strong>Trạng thái:</strong> ${trangThai}</p>
                    <div class="noi-dung-chuong">
                        <h4>Nội dung:</h4>
                        <pre>${chapter.noi_dung.replace(/\n/g, '<br>')}</pre>
                    </div>
                    ${data.is_admin || data.is_author ? `<a href="sua-chuong.html?truyen_id=${truyenId}&chapter_id=${chapterId}" class="edit-btn">Sửa chương</a>` : ''}
                    <a href="quan-ly-chuong.html?truyen_id=${truyenId}" class="back-btn">Quay lại</a>
                `;
            })
            .catch(error => {
                console.error('Lỗi khi tải chi tiết chương:', error);
                const container = document.querySelector('.chi-tiet-chuong-container');
                if (container) container.innerHTML = `<p>Lỗi khi tải chi tiết chương: ${error.message}. Vui lòng thử lại.</p>`;
            });
    });
}