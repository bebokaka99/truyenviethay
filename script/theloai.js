export function initTheLoai() {
  const filterForm = document.getElementById("filter-form");
  const truyenList = document.getElementById("truyen-list");
  const pagination = document.getElementById("pagination");

  // Load danh sách thể loại vào checkbox
  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => res.json())
    .then((data) => {
      const theloaiOptions = document.getElementById("theloai-options");
      if (data.success) {
        theloaiOptions.innerHTML = data.data
          .map(
            (theloai) => `
          <label class="filter-option">
            <input type="checkbox" name="theloai[]" value="${theloai.id_theloai}">
            <span>${theloai.ten_theloai}</span>
          </label>
        `
          )
          .join("");
      }
    });

  // Lấy tham số từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialTheloai = urlParams.getAll("theloai[]");
  if (initialTheloai.length) {
    loadTruyen({ "theloai[]": initialTheloai });
  }

  // Xử lý submit form
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(filterForm);
    const params = Object.fromEntries(formData.entries());
    params["theloai[]"] = formData.getAll("theloai[]"); // Lấy tất cả thể loại đã chọn
    loadTruyen(params);
  });

  function loadTruyen(params) {
    const queryString = new URLSearchParams(params).toString();
    fetch(`/truyenviethay/api/api.php?action=theloai&${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          truyenList.innerHTML = data.data
            .map((truyen) => {
              // Log để kiểm tra giá trị ten_truyen
              console.log(`Tên truyện: ${truyen.ten_truyen}`);

              // Kiểm tra xem có chương mới nhất không
              const hasChapter = truyen.chuong_moi_nhat_so_chuong && truyen.chuong_moi_nhat !== "Chưa có chương";
              const chapterLink = hasChapter
                ? `<a href="chuong.html?truyen_id=${truyen.id}&chuong_id=${truyen.chuong_moi_nhat_so_chuong}" class="chuong-moi">
                   <span>${truyen.chuong_moi_nhat}</span>
                 </a>`
                : `<span class="chuong-moi">Chưa có chương</span>`;

              return `
              <div class="khoi-truyen">
                <div class="image-container">
                  <a href="chi-tiet-truyen.html?truyen_id=${truyen.id}">
                    <img src="${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="anh-truyen">
                  </a>
                  <span class="update-time">${truyen.update_time || 'Chưa cập nhật'}</span>
                </div>
                <div class="thong-tin-truyen">
                  <a href="chi-tiet-truyen.html?truyen_id=${truyen.id}">
                    <h3>${truyen.ten_truyen || 'Không có tên'}</h3>
                  </a>
                  ${chapterLink}
                </div>
              </div>
            `;
            })
            .join("");

          // Cập nhật pagination với các nút bấm
          const currentPage = data.pagination.current_page;
          const totalPages = data.pagination.total_pages;
          let paginationHTML = '';

          // Nút "Trước"
          if (currentPage > 1) {
            paginationHTML += `<a href="#" class="page-link" data-page="${currentPage - 1}"><i class="fa-solid fa-arrow-left"></i></a>`;
          } else {
            paginationHTML += `<span class="page-link disabled"><i class="fa-solid fa-arrow-left"></i></span>`;
          }

          // Hiển thị các số trang (giới hạn số lượng nút hiển thị để tránh quá dài)
          const maxVisiblePages = 5; // Số trang tối đa hiển thị
          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

          // Điều chỉnh startPage nếu endPage chạm tới totalPages
          if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
          }

          // Thêm dấu "..." nếu cần
          if (startPage > 1) {
            paginationHTML += `<a href="#" class="page-link" data-page="1">1</a>`;
            if (startPage > 2) {
              paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
          }

          // Hiển thị các số trang
          for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
          }

          // Thêm dấu "..." và trang cuối nếu cần
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>`;
          }

          // Nút "Sau"
          if (currentPage < totalPages) {
            paginationHTML += `<a href="#" class="page-link" data-page="${currentPage + 1}"><i class="fa-solid fa-arrow-right"></i></a>`;
          } else {
            paginationHTML += `<span class="page-link disabled"><i class="fa-solid fa-arrow-right"></i></span>`;
          }

          pagination.innerHTML = paginationHTML;

          // Thêm sự kiện click cho các nút phân trang
          document.querySelectorAll('.page-link:not(.disabled)').forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const page = parseInt(link.getAttribute('data-page'));
              params.page = page; 
              loadTruyen(params); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            });
          });
        } else {
          truyenList.innerHTML = "<p>Không tìm thấy truyện phù hợp.</p>";
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải truyện:", error);
        truyenList.innerHTML = "<p>Đã có lỗi xảy ra khi tải truyện.</p>";
      });
  }
}