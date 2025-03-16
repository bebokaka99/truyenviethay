export function initManage() {
    if (!window.location.pathname.includes('quan-ly-truyen.html')) {
        return;
    }

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
        })
        .catch(err => {
            console.error('Lỗi tải thông tin user:', err);
        });

    fetch('/truyenviethay/api/api.php?action=theloai&subaction=categories')
        .then(res => res.json())
        .then(data => {
            const theloaiContainer = document.getElementById('theloai-container');
            data.data.forEach(theloai => {
                theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
            });
            theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
        })
        .catch(err => {
            console.error('Lỗi tải thể loại:', err);
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
                console.log('API response (add):', data); // Debug
                const errorDiv = document.getElementById('error-message');
                const successDiv = document.getElementById('success-message');
                errorDiv.style.display = 'none';
                successDiv.style.display = 'none';

                if (data.success) {
                    successDiv.textContent = data.message;
                    successDiv.style.display = 'block';
                    form.reset();
                    formContainer.style.display = 'none';
                    loadTruyen(1, document.getElementById('search-input')?.value || '', document.getElementById('status-filter')?.value || '');
                } else {
                    errorDiv.textContent = data.errors ? Object.values(data.errors)[0] : data.error;
                    errorDiv.style.display = 'block';
                }
            })
            .catch(err => {
                console.error('Lỗi khi thêm truyện:', err);
                document.getElementById('error-message').textContent = 'Lỗi kết nối. Vui lòng thử lại.';
                document.getElementById('error-message').style.display = 'block';
            });
    });

    function loadTruyen(page = 1, search = '', status = '') {
        fetch(`/truyenviethay/api/api.php?action=manage&page=${page}&search=${encodeURIComponent(search)}&status=${status}`)
            .then(res => {
                console.log('API response status (loadTruyen):', res.status); // Debug
                return res.json();
            })
            .then(data => {
                console.log('API response data (loadTruyen):', data); // Debug
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
                                </tr>
                            </thead>
                            <tbody>
                                ${data.data.map(row => `
                                    <tr>
                                        <td data-label="ID">${row.id}</td>
                                        <td data-label="Tên truyện">${row.ten_truyen}</td>
                                        <td data-label="Tác giả">${row.tac_gia || 'Không rõ'}</td>
                                        <td data-label="Ảnh bìa"><img src="${row.anh_bia}" alt="Ảnh bìa"></td>
                                        <td data-label="Ngày cập nhật">${row.thoi_gian_cap_nhat}</td>
                                        <td data-label="Thông tin chương" class="chapter-info">
                                            <span>Số chương: ${row.so_chuong || 0}</span>
                                            ${role === 'admin' ? `<span class="chapter-status ${row.chuong_chua_duyet > 0 ? 'pending' : 'approved'}">${row.chuong_chua_duyet > 0 ? 'Chưa duyệt: ' + row.chuong_chua_duyet : 'Đã duyệt'}</span>` : ''}
                                        </td>
                                        <td data-label="Hành động" class="action-buttons" style="min-width: 200px;">
                                            <a href="edit-truyen.html?truyen_id=${row.id}" class="action-btn edit-btn"><i class="fas fa-edit"></i> Chỉnh sửa</a>
                                            <button class="action-btn delete-btn" data-id="${row.id}"><i class="fas fa-trash"></i> Xóa</button>
                                            <a href="quan-ly-chuong.html?truyen_id=${row.id}" class="action-btn manage-btn"><i class="fas fa-book"></i> Quản lý chương</a>
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
                                        console.log('API response (delete):', data); // Debug
                                        const errorDiv = document.getElementById('error-message');
                                        const successDiv = document.getElementById('success-message');
                                        errorDiv.style.display = 'none';
                                        successDiv.style.display = 'none';

                                        if (data.success) {
                                            successDiv.textContent = data.message;
                                            successDiv.style.display = 'block';
                                            loadTruyen(page, document.getElementById('search-input')?.value || '', document.getElementById('status-filter')?.value || '');
                                        } else {
                                            errorDiv.textContent = data.error;
                                            errorDiv.style.display = 'block';
                                        }
                                    })
                                    .catch(err => {
                                        console.error('Lỗi khi xóa truyện:', err);
                                        document.getElementById('error-message').textContent = 'Lỗi kết nối. Vui lòng thử lại.';
                                        document.getElementById('error-message').style.display = 'block';
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
                        loadTruyen(newPage, document.getElementById('search-input')?.value || '', document.getElementById('status-filter')?.value || '');
                    });
                });
            })
            .catch(err => {
                console.error('Lỗi khi tải danh sách truyện:', err);
                document.getElementById('error-message').textContent = 'Lỗi tải danh sách truyện. Vui lòng thử lại.';
                document.getElementById('error-message').style.display = 'block';
            });
    }

    if (document.getElementById('search-btn') && document.getElementById('search-input') && document.getElementById('status-filter')) {
        document.getElementById('search-btn').addEventListener('click', () => {
            const search = document.getElementById('search-input').value;
            const status = document.getElementById('status-filter').value;
            loadTruyen(1, search, status);
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const search = document.getElementById('search-input').value;
                const status = document.getElementById('status-filter').value;
                loadTruyen(1, search, status);
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        loadTruyen(parseInt(urlParams.get('page')) || 1, '', '');
        
        window.addEventListener('popstate', () => {
            const page = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
            loadTruyen(page, document.getElementById('search-input')?.value || '', document.getElementById('status-filter')?.value || '');
        });
    }
}