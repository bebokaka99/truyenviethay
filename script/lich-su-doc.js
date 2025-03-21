export function initLichSuDoc() {
    if (!window.location.pathname.includes('lich-su-doc.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;

    fetch(`/truyenviethay/api/api.php?action=lich-su-doc&page=${page}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                window.location.href = '/truyenviethay/users/login.html';
                return;
            }

            const historyList = document.getElementById('history-list');
            const pagination = document.getElementById('pagination');

            if (data.history.length === 0) {
                historyList.innerHTML = '<p>Bạn chưa có lịch sử đọc.</p>';
                pagination.innerHTML = '';
                return;
            }

            historyList.innerHTML = data.history.map(item => `
                <div class="history-item">
                    <a href="../truyen/chi-tiet-truyen.html?truyen_id=${item.truyen_id}">
                        <div class="cover-image" style="background-image: url('${item.anh_bia}');">
                            <span class="time-ago">${item.thoi_gian_doc}</span>
                            <button class="delete-btn" data-truyen-id="${item.truyen_id}">X</button>
                        </div>
                    </a>
                    <a href="../truyen/chi-tiet-truyen.html?truyen_id=${item.truyen_id}">
                        <h3>${item.ten_truyen}</h3>
                    </a>
                    <a href="../truyen/chuong.html?truyen_id=${item.truyen_id}&id=${item.chuong_id}">
                        <p>Chương ${item.so_chuong}</p>
                    </a>
                </div>
            `).join('');

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const truyenId = btn.getAttribute('data-truyen-id');
                    if (confirm('Bạn có chắc chắn muốn xóa?')) {
                        fetch('/truyenviethay/api/api.php?action=xoa-lich-su-doc', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `truyen_id=${truyenId}`
                        })
                        .then(res => res.json())
                        .then(res => {
                            if (res.success) {
                                window.location.reload();
                            } else {
                                alert('Lỗi khi xóa lịch sử đọc');
                            }
                        });
                    }
                });
            });

            let paginationHTML = '';
            if (data.current_page > 1) {
                paginationHTML += `<a href="lich-su-doc.html?page=${data.current_page - 1}">Trang trước</a>`;
            }
            for (let i = 1; i <= data.total_pages; i++) {
                if (i === data.current_page) {
                    paginationHTML += `<span class="current">${i}</span>`;
                } else {
                    paginationHTML += `<a href="lich-su-doc.html?page=${i}">${i}</a>`;
                }
            }
            if (data.current_page < data.total_pages) {
                paginationHTML += `<a href="lich-su-doc.html?page=${data.current_page + 1}">Trang sau</a>`;
            }
            pagination.innerHTML = paginationHTML;
        })
        .catch(error => {
            console.error('Lỗi khi tải lịch sử đọc:', error);
            document.getElementById('history-list').innerHTML = '<p>Lỗi khi tải lịch sử đọc. Vui lòng thử lại.</p>';
        });
}