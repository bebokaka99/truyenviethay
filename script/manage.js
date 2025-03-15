export function initManage() {
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

    const addBtn = document.querySelector('.add-truyen-btn');
    const formContainer = document.getElementById('addTruyenForm');
    const closeBtn = formContainer.querySelector('.close-form-btn');
    const cancelBtn = formContainer.querySelector('.cancel-btn');
    const form = document.getElementById('addTruyenFormSubmit');

    addBtn.addEventListener('click', () => formContainer.style.display = 'block');
    closeBtn.addEventListener('click', () => formContainer.style.display = 'none');
    cancelBtn.addEventListener('click', () => formContainer.style.display = 'none');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        formData.append('action', 'add');
        fetch('/truyenviethay/api/api.php?action=manage', {
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
                form.reset();
                formContainer.style.display = 'none';
                loadTruyen();
            } else {
                errorDiv.textContent = data.errors ? Object.values(data.errors)[0] : data.error;
                errorDiv.style.display = 'block';
            }
        });
    });

    function loadTruyen(page = 1) {
        fetch(`/truyenviethay/api/api.php?action=manage&page=${page}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    window.location.href = data.redirect || '/truyenviethay/users/login.html';
                    return;
                }

                const tableContainer = document.getElementById('truyen-table-container');
                if (!data.data.length) {
                    tableContainer.innerHTML = '<p class="no-data">Chưa có truyện nào.</p>';
                } else {
                    let role = data.data.some(row => row.chuong_chua_duyet !== undefined) ? 'admin' : 'author';
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
                                ${data.data.map(row => `
                                    <tr>
                                        <td>${row.id}</td>
                                        <td>${row.ten_truyen}</td>
                                        <td>${row.tac_gia || 'Không rõ'}</td>
                                        <td><img src="${row.anh_bia}" alt="Ảnh bìa" style="width: 50px;"></td>
                                        <td>${row.thoi_gian_cap_nhat}</td>
                                        <td class="chapter-info">
                                            <span>Số chương: ${row.so_chuong || 0}</span>
                                            ${role === 'admin' ? `<span>Bạn có ${row.chuong_chua_duyet} chương chưa phê duyệt</span>` : ''}
                                        </td>
                                        <td>
                                            <a href="edit-truyen.html?id=${row.id}" class="action-btn edit-btn">Chỉnh sửa</a>
                                            <button class="action-btn delete-btn" data-id="${row.id}">Xóa</button>
                                        </td>
                                        <td>
                                            <a href="quan-ly-chuong.html?truyen_id=${row.id}" class="action-btn manage-btn">Quản lý chương</a>
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
                                formData.append('id', btn.dataset.id);
                                fetch('/truyenviethay/api/api.php?action=manage', {
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
                                        loadTruyen(page);
                                    } else {
                                        errorDiv.textContent = data.error;
                                        errorDiv.style.display = 'block';
                                    }
                                });
                            }
                        });
                    });
                }

                const pagination = document.getElementById('pagination');
                pagination.innerHTML = '';
                const { total, per_page, current_page, total_pages } = data.pagination;
                if (current_page > 1) {
                    pagination.innerHTML += `<a href="?page=${current_page - 1}" class="page-link">« Trước</a>`;
                }
                for (let i = 1; i <= total_pages; i++) {
                    pagination.innerHTML += `<a href="?page=${i}" class="page-link ${i === current_page ? 'active' : ''}">${i}</a>`;
                }
                if (current_page < total_pages) {
                    pagination.innerHTML += `<a href="?page=${current_page + 1}" class="page-link">Sau »</a>`;
                }
                pagination.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const newPage = parseInt(new URLSearchParams(link.search).get('page'));
                        window.history.pushState({}, '', `quan-ly-truyen.html?page=${newPage}`);
                        loadTruyen(newPage);
                    });
                });
            });
    }

    const urlParams = new URLSearchParams(window.location.search);
    loadTruyen(parseInt(urlParams.get('page')) || 1);

    window.addEventListener('popstate', () => {
        const page = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
        loadTruyen(page);
    });
}