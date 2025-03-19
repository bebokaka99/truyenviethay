export function initChiTiet() {
    const urlParams = new URLSearchParams(window.location.search);
    const truyenId = urlParams.get('truyen_id');
    if (!truyenId) {
        document.querySelector('.truyen-container').innerHTML = '<p>Truyện không hợp lệ.</p>';
        return;
    }

    fetch(`/truyenviethay/api/api.php?action=chi-tiet&truyen_id=${truyenId}`)
        .then(res => res.json())
        .then(data => {
            console.log('Dữ liệu API chi tiết truyện:', data);
            if (data.error) {
                document.querySelector('.truyen-container').innerHTML = `<p>${data.error}</p>`;
                return;
            }

            document.getElementById('truyen-title').textContent = `${data.ten_truyen} - Truyenviethay`;
            document.getElementById('ten-truyen').textContent = data.ten_truyen;
            document.getElementById('truyen-image').innerHTML = data.anh_bia_url ? `<img src="${data.anh_bia_url}" alt="${data.ten_truyen}" class="truyen-cover">` : '<p class="error-image">Ảnh bìa không tồn tại</p>';
            document.getElementById('mo-ta').textContent = data.mo_ta || 'Chưa có mô tả';

            const truyenInfo = document.getElementById('truyen-info');
            truyenInfo.innerHTML = `
                <div class="info-item"><span class="info-icon"><i class="fas fa-user"></i></span><label>Tác giả:</label><span>${data.tac_gia || 'Đần giả'}</span></div>
                <div class="info-item"><span class="info-icon"><i class="fas fa-clock"></i></span><label>Tình trạng:</label><span>${data.tinh_trang || 'Đang tiến hành'}</span></div>
                <div class="info-item"><span class="info-icon"><i class="fas fa-heart"></i></span><label>Lượt thích:</label><span class="luot-thich">${data.luot_thich || 0}</span></div>
                <div class="info-item"><span class="info-icon"><i class="fas fa-users"></i></span><label>Lượt theo dõi:</label><span class="luot-theo-doi">${data.luot_theo_doi || 0}</span></div>
                <div class="info-item"><span class="info-icon"><i class="fas fa-eye"></i></span><label>Lượt xem:</label><span>${data.luot_xem || 0}</span></div>
                <div class="info-item"><span class="info-icon"><i class="fas fa-star rating-star"></i></span><label>Đánh giá:</label>
                    <span class="rating-stars" data-rating="${data.rating || 4.8}">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </span>
                    <span class="rating-value">${data.rating || 4.8} / 5</span>
                </div>
                <div class="info-item the-loai"><span class="info-icon"><i class="fas fa-tags"></i></span><label>Thể loại:</label>
                    <div class="tags">${data.theloai.length > 0 ? data.theloai.map(t => `<a href="../truyen/the-loai.html?theloai[]=${t.id_theloai}" class="tag-btn">${t.ten_theloai}</a>`).join('') : '<span>Chưa có thể loại</span>'}</div>
                </div>
                <div class="action-buttons" id="action-buttons"></div>
            `;

            const actionButtons = document.getElementById('action-buttons');
            const chapterCount = data.chapters.length;
            actionButtons.innerHTML = `
                ${chapterCount > 0 ? `<a href="chuong.html?truyen_id=${truyenId}&chuong_id=1" class="read-btn"><i class="fas fa-book-reader"></i> Đọc từ đầu</a>` : `<a href="#" class="read-btn disabled"><i class="fas fa-book-reader"></i> Đọc từ đầu</a>`}
                ${chapterCount > 0 ? `<a href="chuong.html?truyen_id=${truyenId}&chuong_id=${data.chuong_gan_nhat > 0 ? data.chuong_gan_nhat : 1}" class="continue-btn"><i class="fas fa-arrow-right"></i> Đọc tiếp</a>` : `<a href="#" class="continue-btn disabled"><i class="fas fa-arrow-right"></i> Đọc tiếp</a>`}
                <button id="follow-btn" class="follow-btn"><i class="fas fa-heart"></i> Theo dõi</button>
                <button id="like-btn" class="like-btn"><i class="fas fa-thumbs-up"></i> Thích</button>
            `;

            fetch('/truyenviethay/api/api.php?action=user')
                .then(res => res.json())
                .then(user => {
                    const followBtn = document.getElementById('follow-btn');
                    const likeBtn = document.getElementById('like-btn');

                    if (user.loggedIn) {
                        Promise.all([
                            fetch(`/truyenviethay/api/api.php?action=like&truyen_id=${truyenId}`),
                            fetch(`/truyenviethay/api/api.php?action=follow&truyen_id=${truyenId}`)
                        ])
                        .then(([likeRes, followRes]) => Promise.all([likeRes.json(), followRes.json()]))
                        .then(([likeData, followData]) => {
                            if (likeData.liked) {
                                likeBtn.classList.add('liked');
                                likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Đã thích`;
                            }
                            if (followData.followed) {
                                followBtn.classList.add('followed');
                                followBtn.innerHTML = `<i class="fas fa-heart"></i> Đã theo dõi`;
                            }

                            likeBtn.addEventListener('click', () => {
                                fetch('/truyenviethay/api/api.php?action=like', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: `truyen_id=${truyenId}`
                                })
                                .then(res => res.json())
                                .then(res => {
                                    if (res.success) {
                                        likeBtn.classList.toggle('liked', res.liked);
                                        likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${res.liked ? 'Đã thích' : 'Thích'}`;
                                        document.querySelector('.luot-thich').textContent = res.luot_thich;
                                    } else {
                                        alert(res.error || 'Lỗi khi thích');
                                    }
                                });
                            });

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
                                        followBtn.innerHTML = `<i class="fas fa-heart"></i> ${res.followed ? 'Đã theo dõi' : 'Theo dõi'}`;
                                        document.querySelector('.luot-theo-doi').textContent = res.luot_theo_doi;
                                    } else {
                                        alert(res.error || 'Lỗi khi theo dõi');
                                    }
                                });
                            });
                        })
                        .catch(err => console.error('Lỗi khi lấy trạng thái ban đầu:', err));
                    } else {
                        followBtn.addEventListener('click', () => alert('Vui lòng đăng nhập để theo dõi truyện.'));
                        likeBtn.addEventListener('click', () => alert('Vui lòng đăng nhập để thích truyện.'));
                    }

                    const commentForm = document.getElementById('comment-form');
                    commentForm.innerHTML = user.loggedIn ? `
                        <form id="comment-form-submit" class="comment-form-container">
                            <div class="comment-input-wrapper">
                                <img src="${user.avatar}" alt="Avatar" class="comment-avatar">
                                <textarea name="comment_content" placeholder="Nhập bình luận của bạn..." required style="height: 40px; resize: none;"></textarea>
                            </div>
                            <button type="submit" class="submit-commentBtn"><i class="fas fa-paper-plane"></i> Gửi</button>
                        </form>
                    ` : `<p>Vui lòng <a href="/truyenviethay/users/login.html" style="color: #4CAF50;">đăng nhập</a> để bình luận.</p>`;

                    if (user.loggedIn) {
                        document.getElementById('comment-form-submit').addEventListener('submit', (e) => {
                            e.preventDefault();
                            const content = document.querySelector('textarea[name="comment_content"]').value;
                            fetch('/truyenviethay/api/api.php?action=comment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `truyen_id=${truyenId}&content=${encodeURIComponent(content)}`
                            })
                            .then(res => res.json())
                            .then(res => {
                                if (res.success) location.reload();
                                else alert(res.error || 'Lỗi khi gửi bình luận');
                            });
                        });
                    }
                });

            document.getElementById('chapter-count').textContent = `Tổng số chương: ${chapterCount}`;
            const chapterList = document.getElementById('chapter-list');
            chapterList.innerHTML = chapterCount > 0 ? data.chapters.map(ch => `
                <div class="chuong-item">
                    <a href="chuong.html?truyen_id=${truyenId}&chuong_id=${ch.id}">
                        <span class="chuong-title ${data.chuong_da_doc.includes(ch.id) ? 'chuong-da-doc' : ''}">Chương ${ch.id}</span>
                    </a>
                    <span>${new Date(ch.thoi_gian).toLocaleString('vi-VN')}</span>
                </div>
            `).join('') : '<p class="no-chapters">Hiện không có chương nào!</p>';

            const commentList = document.getElementById('comment-list');
            commentList.innerHTML = data.comments.length > 0 ? data.comments.map(c => `
                <div class="comment-item">
                    <div class="comment-header">
                        <img src="${c.avatar}" alt="Avatar" class="comment-avatar">
                        <div class="comment-user-info">
                            <span class="comment-user">${c.full_name}</span>
                            <span class="comment-time">${new Date(c.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                    <div class="comment-content"><p>${c.content}</p></div>
                    <div class="comment-actions">
                        <button class="comment-action-btn"><i class="fas fa-thumbs-up"></i> Thích</button>
                        <button class="comment-action-btn"><i class="fas fa-reply"></i> Trả lời</button>
                    </div>
                </div>
            `).join('') : '<p class="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
        })
        .catch(error => {
            console.error('Lỗi khi tải chi tiết truyện:', error);
            document.querySelector('.truyen-container').innerHTML = '<p>Truyện không hợp lệ.</p>';
        });
}