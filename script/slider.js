// script/slider.js
// Hàm cắt chuỗi chỉ lấy phần "Chương X"
function getChapterNumber(chapter) {
    if (!chapter || chapter === 'Chương 1') return 'Chương 1';
    const parts = chapter.split(':');
    return parts[0].trim();
}

// Hàm tính thời gian tương đối
function getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds} giây trước`;
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    if (weeks < 4) return `${weeks} tuần trước`;
    if (months < 12) return `${months} tháng trước`;
    return `${years} năm`;
}

export function initSlider() {
    fetch('/truyenviethay/api/api.php?action=truyen&subaction=slider')
        .then(res => res.json())
        .then(data => {
            const sliderContainer = document.getElementById('slider-container');
            if (!data.success || !data.data.length) {
                sliderContainer.innerHTML = '<p>Chưa có truyện nào.</p>';
                return;
            }

            // Giới hạn 10 truyện
            const totalSlides = 10;
            let slidesData = data.data.slice(0, totalSlides);
            console.log(`Số truyện thực tế từ API: ${slidesData.length}`);
            if (slidesData.length < totalSlides) {
                console.warn(`Chỉ có ${slidesData.length} truyện, cần 10 truyện để hiển thị slider.`);
                while (slidesData.length < totalSlides) {
                    slidesData = slidesData.concat(slidesData);
                }
                slidesData = slidesData.slice(0, totalSlides);
            }

            // Tạo HTML cho slider
            sliderContainer.innerHTML = `
                <div class="danh-sach-truyen">
                    ${slidesData.map(truyen => {
                        const hasChapter = truyen.chuong_moi_nhat_so_chuong && truyen.chuong_moi_nhat !== "Chưa có chương";
                        const chapterLink = hasChapter
                            ? `<a href="truyen/chuong.html?truyen_id=${truyen.id}&chuong_id=${truyen.chuong_moi_nhat_so_chuong}" class="chuong-moi">${getChapterNumber(truyen.chuong_moi_nhat)}</a>`
                            : `<span class="chuong-moi">Chưa có chương</span>`;

                        // Làm tròn rating về 1 chữ số thập phân
                        const rating = truyen.rating ? parseFloat(truyen.rating).toFixed(1) : '0';

                        return `
                            <div class="truyen">
                                <a href="truyen/chi-tiet-truyen.html?truyen_id=${truyen.id}" class="truyen-link">
                                    ${truyen.anh_bia ?
                                        `<img src="anh/${truyen.anh_bia}" alt="${truyen.ten_truyen}">` :
                                        `<div class="error-image">Không có ảnh</div>`}
                                    <div class="thoi-gian-danh-gia">
                                        <span class="thoi-gian">${getRelativeTime(truyen.thoi_gian_cap_nhat) || 'Chưa cập nhật'}</span>
                                        <span class="danh-gia">${rating} <i class="fas fa-star"></i></span>
                                    </div>
                                    <span class="ten-truyen">${truyen.ten_truyen}</span>
                                </a>
                                ${chapterLink}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            // Logic điều hướng slider
            const prevButton = document.querySelector('.nut-trai');
            const nextButton = document.querySelector('.nut-phai');
            let currentIndex = 0;
            const slides = sliderContainer.querySelectorAll('.truyen');
            const slideCount = slides.length;
            const visibleSlides = 7;
            const maxIndex = slideCount - visibleSlides;
            let direction = 1;

            if (slideCount < visibleSlides) {
                console.error(`Không đủ truyện để hiển thị slider. Cần ít nhất ${visibleSlides} truyện, hiện có ${slideCount} truyện.`);
                return;
            }

            function updateSlider() {
                const slideWidth = 100 / visibleSlides;
                const translateX = -(currentIndex * slideWidth);
                sliderContainer.querySelector('.danh-sach-truyen').style.transform = `translateX(${translateX}%)`;
            }

            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex -= 1;
                    if (currentIndex < 0) currentIndex = 0;
                } else {
                    currentIndex = maxIndex;
                }
                updateSlider();
            });

            nextButton.addEventListener('click', () => {
                if (currentIndex < maxIndex) {
                    currentIndex += 1;
                    if (currentIndex > maxIndex) currentIndex = maxIndex;
                } else {
                    currentIndex = 0;
                }
                updateSlider();
            });

            // Auto slide
            setInterval(() => {
                if (direction === 1) {
                    if (currentIndex < maxIndex) {
                        currentIndex += 1;
                        if (currentIndex > maxIndex) currentIndex = maxIndex;
                    } else {
                        direction = -1;
                        currentIndex -= 1;
                        if (currentIndex < 0) currentIndex = 0;
                    }
                } else {
                    if (currentIndex > 0) {
                        currentIndex -= 1;
                        if (currentIndex < 0) currentIndex = 0;
                    } else {
                        direction = 1;
                        currentIndex += 1;
                        if (currentIndex > maxIndex) currentIndex = maxIndex;
                    }
                }
                updateSlider();
            }, 5000);
        })
        .catch(error => {
            console.error('Lỗi khi tải slider:', error);
            sliderContainer.innerHTML = '<p>Đã có lỗi xảy ra khi tải slider.</p>';
        });
}