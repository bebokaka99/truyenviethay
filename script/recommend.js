// script/recommend.js
import { timeAgo } from "./truyen.js"; // Import timeAgo từ truyen.js

export function initRecommend() {
    const indexContainer = document.getElementById('index-recommend-container');
    const detailContainer = document.getElementById('detail-recommend-container');
    const truyenId = new URLSearchParams(window.location.search).get('truyen_id'); // Lấy truyen_id từ URL

    // Hàm render truyện
    function renderTruyen(container, truyenList) {
        container.innerHTML = '';
        truyenList.forEach(truyen => {
            const div = document.createElement('div');
            div.className = 'khoi-truyen';
            const rating = truyen.rating ? parseFloat(truyen.rating).toFixed(1) : '0';
            div.innerHTML = `
                <a href="/truyenviethay/truyen/chi-tiet-truyen.html?truyen_id=${truyen.id}">
                    <img class="anh-truyen" src="/truyenviethay/anh/${truyen.anh_bia}" alt="${truyen.ten_truyen}">
                </a>
                <div class="thong-tin-truyen">
                    <div class="thoi-gian-danh-gia">
                        <span class="thoi-gian">${timeAgo(truyen.thoi_gian_cap_nhat)}</span>
                        <span class="danh-gia"><i class="fas fa-star"></i> ${rating}</span>
                    </div>
                    <a href="/truyenviethay/truyen/chi-tiet-truyen.html?truyen_id=${truyen.id}">
                        <h3>${truyen.ten_truyen}</h3>
                    </a>
                    <span class="chuong-moi">Chưa có chương</span> <!-- Cần thêm logic lấy chương -->
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Gọi API
    const url = truyenId ? `/truyenviethay/api/api.php?action=recommend&truyen_id=${truyenId}` : '/truyenviethay/api/api.php?action=recommend';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (indexContainer && data.index_recommend) {
                const limitedIndexData = data.index_recommend.slice(0, 16); 
                renderTruyen(indexContainer, data.index_recommend);
            }
            if (detailContainer && data.detail_recommend) {
                renderTruyen(detailContainer, data.detail_recommend);
            }
        })
        .catch(error => console.error('Lỗi khi lấy gợi ý:', error));
}

// Khởi chạy khi cần
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/truyenviethay/') {
        initRecommend();
    }
    if (window.location.pathname.includes('chi-tiet-truyen.html')) {
        initRecommend();
    }
});