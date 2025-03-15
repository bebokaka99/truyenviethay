// Hàm cắt chuỗi chỉ lấy phần "Chương X"
function getChapterNumber(chapter) {
    if (!chapter || chapter === 'Chương 1') return 'Chương 1';
    // Cắt chuỗi tại dấu ":" và lấy phần đầu
    const parts = chapter.split(':');
    return parts[0].trim(); // Trả về "Chương X"
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

            // Sử dụng class .danh-sach-truyen và .truyen để khớp với CSS
            sliderContainer.innerHTML = `
                <div class="danh-sach-truyen">
                    ${data.data.map(truyen => `
                        <div class="truyen">
                            <a href="truyen/chi-tiet-truyen.html?truyen_id=${truyen.id}">
                                ${truyen.anh_bia ? 
                                    `<img src="anh/${truyen.anh_bia}" alt="${truyen.ten_truyen}">` : 
                                    `<div class="error-image">Không có ảnh</div>`}
                                <span class="ten-truyen">${truyen.ten_truyen}</span>
                                <a href="#" class="chuong-moi">${getChapterNumber(truyen.chuong_moi_nhat)}</a>
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;

            // Logic điều hướng slider
            const prevButton = document.querySelector('.nut-trai');
            const nextButton = document.querySelector('.nut-phai');
            let currentIndex = 0;
            const slides = sliderContainer.querySelectorAll('.truyen');
            const slideCount = slides.length;

            if (slideCount === 0) {
                console.error('Không có slide nào để hiển thị.');
                return;
            }

            function updateSlider() {
                sliderContainer.querySelector('.danh-sach-truyen').style.transform = `translateX(-${currentIndex * (100 / slideCount)}%)`;
            }

            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlider();
                }
            });

            nextButton.addEventListener('click', () => {
                if (currentIndex < slideCount - 1) {
                    currentIndex++;
                    updateSlider();
                }
            });

            // Auto slide
            setInterval(() => {
                if (currentIndex < slideCount - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0;
                }
                updateSlider();
            }, 5000);
        })
        .catch(error => console.error('Lỗi khi tải slider:', error));
}