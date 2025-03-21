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
            .map(
              (truyen) => `
            <div class="khoi-truyen">
              <a href="chi-tiet-truyen.html?truyen_id=${truyen.id}">
                <img src="${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="anh-truyen">
                <h3>${truyen.ten_truyen}</h3>
                <span>${truyen.chuong_moi_nhat}</span>
              </a>
            </div>
          `
            )
            .join("");
          // Xử lý phân trang (tạm thời để đơn giản)
          pagination.innerHTML = `Trang ${data.pagination.current_page}/${data.pagination.total_pages}`;
        } else {
          truyenList.innerHTML = "<p>Không tìm thấy truyện phù hợp.</p>";
        }
      });
  }
}
