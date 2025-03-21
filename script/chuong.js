export function initChuong() {
    const urlParams = new URLSearchParams(window.location.search);
    const truyenId = urlParams.get('truyen_id');
    const chuongId = urlParams.get('chuong_id') || 1;

    if (!truyenId || !chuongId) {
        document.querySelector('.doc-truyen-container').innerHTML = '<p>Truyện hoặc chương không hợp lệ.</p>';
        return;
    }

    fetch(`/truyenviethay/api/api.php?action=chuong&truyen_id=${truyenId}&chapter_id=${chuongId}`)
        .then(res => res.json())
        .then(data => {
            console.log('Dữ liệu API chương:', data);
            if (data.error) {
                document.querySelector('.doc-truyen-container').innerHTML = `<p>${data.error}</p>`;
                return;
            }

            document.getElementById('page-title').textContent = `${data.chuong.tieu_de} - ${data.ten_truyen} - Truyenviethay`;
            document.getElementById('breadcrumb').innerHTML = `
                <a href="../index.html" class="breadcrumb-item"><i class="fas fa-home"></i> Trang chủ</a>
                <span class="breadcrumb-separator">/</span>
                <a href="chi-tiet-truyen.html?truyen_id=${truyenId}" class="breadcrumb-item">${data.ten_truyen}</a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Chương ${chuongId}</span>
            `;
            document.getElementById('truyen-title').textContent = data.ten_truyen;
            document.getElementById('chapter-title').textContent = data.chuong.tieu_de;
            document.getElementById('noi-dung-truyen').innerHTML = data.chuong.noi_dung.replace(/\n/g, '<br>');

            const nav = document.getElementById('chapter-navigation');
            // Kiểm tra nếu data.chapters không tồn tại hoặc rỗng
            const chapters = Array.isArray(data.chapters) ? data.chapters : [];
            nav.innerHTML = `
                <a href="../index.html" class="nav-btn home"><i class="fas fa-home"></i> Trang chủ</a>
                <button class="nav-btn kieu-chu" onclick="toggleFontSettings()"><i class="fas fa-font"></i> Kiểu chữ</button>
                <button class="nav-btn prev-btn" ${data.chuong_truoc === null ? 'disabled' : ''} data-chuong-id="${data.chuong_truoc || 'null'}">
                    <i class="fas fa-arrow-left"></i> Chương trước
                </button>
                <select class="chapter-selector" id="chapterSelector">
                    ${chapters.length > 0 ? chapters.map(ch => `<option value="${ch.so_chuong}" ${ch.so_chuong == chuongId ? 'selected' : ''}>Chương ${ch.so_chuong}</option>`).join('') : '<option value="">Không có chương</option>'}
                </select>
                <button class="nav-btn next-btn" ${data.chuong_sau === null ? 'disabled' : ''} data-chuong-id="${data.chuong_sau || 'null'}">
                    Chương sau <i class="fas fa-arrow-right"></i>
                </button>
                <button class="nav-btn bao-loi" onclick="reportError()"><i class="fas fa-exclamation-triangle"></i> Báo lỗi</button>
                <button id="follow-btn" class="nav-btn follow-btn ${data.hasFollowed ? 'followed' : ''}">
                    <i class="fas fa-bookmark"></i> ${data.hasFollowed ? 'Đã theo dõi' : 'Theo dõi'}
                </button>
            `;

            document.querySelectorAll('.prev-btn, .next-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const nextId = btn.getAttribute('data-chuong-id');
                    if (nextId !== 'null') window.location.href = `chuong.html?truyen_id=${truyenId}&chuong_id=${nextId}`;
                });
            });

            document.getElementById('chapterSelector').addEventListener('change', (e) => {
                if (e.target.value) {
                    window.location.href = `chuong.html?truyen_id=${truyenId}&chuong_id=${e.target.value}`;
                }
            });

            fetch('/truyenviethay/api/api.php?action=user')
                .then(res => res.json())
                .then(user => {
                    const followBtn = document.getElementById('follow-btn');
                    if (user.loggedIn) {
                        followBtn.addEventListener('click', () => {
                            fetch('/truyenviethay/api/api.php?action=follow', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `truyen_id=${truyenId}`
                            })
                            .then(res => res.json())
                            .then(res => {
                                if (res.success) {
                                    followBtn.classList.toggle('followed', res.followed);
                                    followBtn.innerHTML = `<i class="fas fa-bookmark"></i> ${res.followed ? 'Đã theo dõi' : 'Theo dõi'}`;
                                } else alert(res.error || 'Lỗi khi theo dõi');
                            });
                        });
                    } else {
                        followBtn.addEventListener('click', () => alert('Vui lòng đăng nhập để theo dõi truyện.'));
                    }
                });
        })
        .catch(error => {
            console.error('Lỗi khi tải chương:', error);
            document.querySelector('.doc-truyen-container').innerHTML = '<p>Lỗi khi tải chương. Vui lòng thử lại.</p>';
        });
}

window.toggleFontSettings = () => {
    const settings = document.getElementById('fontSettings');
    settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
};

window.changeFontSize = (delta) => {
    const content = document.getElementById('noi-dung-truyen');
    const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
    content.style.fontSize = `${currentSize + delta}px`;
};

window.toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
};

window.reportError = () => {
    alert('Chức năng báo lỗi chưa được tích hợp.');
};