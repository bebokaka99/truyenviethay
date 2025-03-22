export function initManageAuthor() {
    fetch('/truyenviethay/api/api.php?action=profile')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = data.redirect || '/truyenviethay/users/login.html';
                return;
            }
            document.getElementById('login-link').style.display = 'none';
            document.getElementById('register-link').style.display = 'none';
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            const userInfo = document.getElementById('user-info');
            userInfo.style.display = 'block';
            document.getElementById('user-avatar').src = '../' + data.data.avatar;
        });

    fetch('/truyenviethay/api/api.php?action=theloai&subaction=categories')
        .then(res => res.json())
        .then(data => {
            const theloaiContainer = document.getElementById('theloai-container');
            data.data.forEach(theloai => {
                theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
            });
            theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
        });

    function loadTruyen() {
        fetch('/truyenviethay/api/api.php?action=manage-author')
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    document.querySelector('.quan-ly-truyen-container').innerHTML = `<p>${data.error}</p>`;
                    return;
                }

                const tableContainer = document.getElementById('truyen-table-container');
                if (!data.data.length) {
                    tableContainer.innerHTML = '<p class="no-data">Bạn chưa đăng tải truyện nào hoặc truyện đã bị xóa vì vi phạm điều khoản trang web.</p>';
                } else {
                    tableContainer.innerHTML = `
                        <table class="truyen-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên truyện</th>
                                    <th>Tác giả</th>
                                    <th>Ảnh bìa</th>
                                    <th>Ngày cập nhật</th>
                                    <th>Thông tin chương</th>
                                    <th>Hành động</th>
                                    <th>Quản lý chương</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.data.map(truyen => `
                                    <tr>
                                        <td>${truyen.id}</td>
                                        <td>${truyen.ten_truyen}</td>
                                        <td>${truyen.tac_gia || 'Không rõ'}</td>
                                        <td><img src="${truyen.anh_bia ? '../anh/' + truyen.anh_bia : '../anh/default-truyen.jpg'}" alt="Ảnh bìa" style="width: 50px;"></td>
                                        <td>${truyen.thoi_gian_cap_nhat}</td>
                                        <td class="chapter-info">
                                            <span>Số chương: ${truyen.so_chuong || 0}</span>
                                            <span>Bạn có ${truyen.chuong_cho_duyet} chương đang chờ phê duyệt</span>
                                        </td>
                                        <td>
                                            <a href="edit-truyen.html?truyen_id=${truyen.id}" class="action-btn edit-btn">Chỉnh sửa</a>
                                            <button class="action-btn delete-btn" data-id="${truyen.id}">Xóa</button>
                                        </td>
                                        <td>
                                            <a href="quan-ly-chuong.html?truyen_id=${truyen.id}" class="action-btn manage-btn">Quản lý chương</a>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>`;

                    tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (confirm('Bạn có chắc chắn muốn xóa truyện này?')) {
                                const formData = new FormData();
                                formData.append('action', 'delete');
                                formData.append('truyen_id', btn.dataset.id);
                                fetch('/truyenviethay/api/api.php?action=manage-author', {
                                    method: 'POST',
                                    body: formData
                                })
                                .then(res => res.json())
                                .then(data => {
                                    const errorDiv = document.getElementById('error-message');
                                    const successDiv = document.getElementById('success-message');
                                    errorDiv.style.display = 'none';
                                    successDiv.style.display = 'none';

                                    if (data.success) {
                                        successDiv.textContent = data.message;
                                        successDiv.style.display = 'block';
                                        loadTruyen();
                                    } else {
                                        errorDiv.textContent = data.error;
                                        errorDiv.style.display = 'block';
                                    }
                                });
                            }
                        });
                    });
                }
            });
    }

    loadTruyen();
}