export function initSearch() {
    fetch('/truyenviethay/api/api.php?action=profile')
        .then(res => res.json())
        .then(data => {
            const loginLink = document.getElementById('login-link');
            const registerLink = document.getElementById('register-link');
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const userInfo = document.getElementById('user-info');

            if (data.success) {
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                userInfo.style.display = 'block';
                document.getElementById('user-avatar').src = '../' + data.data.avatar;
            } else {
                loginLink.style.display = 'block';
                registerLink.style.display = 'block';
                loginBtn.style.display = 'block';
                registerBtn.style.display = 'block';
                userInfo.style.display = 'none';
            }
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

    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('q') || '';
    const page = parseInt(urlParams.get('page')) || 1;

    document.getElementById('search-input').value = keyword;
    document.getElementById('search-input-right').value = keyword;

    function loadResults(kw = keyword, pg = page) {
        fetch(`/truyenviethay/api/api.php?action=search&q=${encodeURIComponent(kw)}&page=${pg}`)
            .then(res => res.json())
            .then(data => {
                const title = document.getElementById('search-title').querySelector('h2');
                const results = document.getElementById('search-results');
                const pagination = document.getElementById('pagination');

                title.textContent = `Kết quả tìm kiếm cho: "${data.keyword || kw}"`;
                if (!data.success) {
                    results.innerHTML = `<p>${data.message}</p>`;
                    pagination.innerHTML = '';
                    return;
                }

                if (!data.data.length) {
                    results.innerHTML = `<p>Không tìm thấy truyện phù hợp với từ khóa "${data.keyword}".</p>`;
                    pagination.innerHTML = '';
                } else {
                    results.innerHTML = `
                        <div class="luoi-truyen">
                            ${data.data.map(truyen => `
                                <div class="khoi-truyen">
                                    <a href="chi-tiet-truyen.html?truyen_id=${truyen.id}">
                                        ${truyen.anh_bia ? 
                                            `<img src="../anh/${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="anh-truyen">` : 
                                            `<div class="error-image">Không có ảnh</div>`}
                                        <div class="thong-tin-truyen">
                                            <div class="thoi-gian-danh-gia">
                                                <span class="thoi-gian">${truyen.update_time}</span>
                                                <span class="danh-gia"><i class="fas fa-star"></i> ${truyen.rating || 'N/A'}</span>
                                            </div>
                                            <h3>${truyen.ten_truyen}</h3>
                                            <a href="#" class="chuong-moi">${truyen.chuong_moi_nhat}</a>
                                            ${truyen.is_hot == 1 ? '<span class="hot-label">Hot</span>' : ''}
                                        </div>
                                    </a>
                                </div>
                            `).join('')}
                        </div>`;

                    pagination.innerHTML = '';
                    if (data.total_pages > 1) {
                        if (data.current_page > 1) {
                            pagination.innerHTML += `<a href="?q=${encodeURIComponent(kw)}&page=${data.current_page - 1}" class="page-link">«</a>`;
                        }
                        for (let i = 1; i <= data.total_pages; i++) {
                            pagination.innerHTML += `<a href="?q=${encodeURIComponent(kw)}&page=${i}" class="page-link ${i === data.current_page ? 'active' : ''}">${i}</a>`;
                        }
                        if (data.current_page < data.total_pages) {
                            pagination.innerHTML += `<a href="?q=${encodeURIComponent(kw)}&page=${data.current_page + 1}" class="page-link">»</a>`;
                        }
                    }
                }
            });
    }

    loadResults();

    [document.getElementById('search-form'), document.getElementById('search-form-right')].forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newKeyword = form.querySelector('input[name="q"]').value.trim();
            if (newKeyword) {
                window.history.pushState({}, '', `?q=${encodeURIComponent(newKeyword)}`);
                loadResults(newKeyword, 1);
            }
        });
    });

    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        loadResults(params.get('q') || '', parseInt(params.get('page')) || 1);
    });
}