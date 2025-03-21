export function initTheLoai() {
  fetch("/truyenviethay/api/api.php?action=profile")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("login-link").style.display = "none";
        document.getElementById("register-link").style.display = "none";
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("register-btn").style.display = "none";
        const userInfo = document.getElementById("user-info");
        userInfo.style.display = "block";
        document.getElementById("user-avatar").src = "../" + data.data.avatar;
      }
    });

  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => res.json())
    .then((data) => {
      const theloaiOptions = document.getElementById("theloai-options");
      const theloaiContainer = document.getElementById("theloai-container");
      if (!data.success || data.data.length === 0) {
        theloaiContainer.innerHTML = "<p>Chưa có thể loại nào</p>";
        theloaiOptions.innerHTML = "<p>Chưa có thể loại nào để lọc</p>";
      } else {
        data.data.forEach((theloai) => {
          theloaiOptions.innerHTML += `
                        <label class="filter-option">
                            <input type="checkbox" name="theloai[]" value="${theloai.id_theloai}">
                            <span>${theloai.ten_theloai}</span>
                        </label>`;
          theloaiContainer.innerHTML += `<a href="the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
        });
        theloaiContainer.innerHTML += `<a href="the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
      }
    })
    .catch((error) => {
      console.error("Lỗi khi tải thể loại:", error);
      const theloaiContainer = document.getElementById("theloai-container");
      theloaiContainer.innerHTML =
        "<p>Lỗi khi tải thể loại. Vui lòng thử lại.</p>";
    });

  fetch("/truyenviethay/api/api.php?action=theloai&subaction=years")
    .then((res) => res.json())
    .then((data) => {
      const namDangOptions = document.getElementById("nam-dang-options");
      data.data.forEach((nam) => {
        namDangOptions.innerHTML += `
                    <label class="filter-option">
                        <input type="radio" name="nam_dang" value="${nam}">
                        <span>${nam}</span>
                    </label>`;
      });
      namDangOptions.innerHTML += `
                <label class="filter-option">
                    <input type="radio" name="nam_dang" value="older">
                    <span>Cũ hơn</span>
                </label>`;
    });

  const form = document.getElementById("filter-form");
  const urlParams = new URLSearchParams(window.location.search);
  form.querySelectorAll("input").forEach((input) => {
    if (input.type === "checkbox") {
      if (urlParams.getAll("theloai[]").includes(input.value))
        input.checked = true;
    } else if (input.type === "radio") {
      if (urlParams.get(input.name) === input.value) input.checked = true;
    }
  });

  function loadTruyen(params) {
    const query = new URLSearchParams(params).toString();
    fetch(`/truyenviethay/api/api.php?action=theloai&${query}`)
      .then((res) => res.json())
      .then((data) => {
        const truyenList = document.getElementById("truyen-list");
        truyenList.innerHTML = data.data.length
          ? ""
          : "<p>Không tìm thấy truyện phù hợp với bộ lọc.</p>";
        data.data.forEach((truyen) => {
          truyenList.innerHTML += `
                        <div class="khoi-truyen">

                            <a href="chi-tiet-truyen.html?truyen_id=${truyen.id}">
                                <img src="${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="anh-truyen" onerror="this.outerHTML='<div class=error-image>Không có ảnh</div>'">

                                <div class="thong-tin-truyen">
                                    <div class="thoi-gian-danh-gia">
                                        <span class="thoi-gian">${
                                          truyen.update_time
                                        }</span>
                                        <span class="danh-gia"><i class="fas fa-star"></i> ${
                                          truyen.rating || "N/A"
                                        }</span>
                                    </div>
                                    <h3>${truyen.ten_truyen}</h3>
                                    <a href="#" class="chuong-moi">${
                                      truyen.chuong_moi_nhat
                                    }</a>
                                </div>
                            </a>
                        </div>`;
        });

        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";
        const { total, per_page, current_page, total_pages } = data.pagination;
        if (current_page > 1) {
          params.page = current_page - 1;
          pagination.innerHTML += `<a href="the-loai.html?${new URLSearchParams(
            params
          )}" class="page-link">«</a>`;
        }
        for (let i = 1; i <= total_pages; i++) {
          params.page = i;
          pagination.innerHTML += `<a href="the-loai.html?${new URLSearchParams(
            params
          )}" class="page-link ${i === current_page ? "active" : ""}">${i}</a>`;
        }
        if (current_page < total_pages) {
          params.page = current_page + 1;
          pagination.innerHTML += `<a href="the-loai.html?${new URLSearchParams(
            params
          )}" class="page-link">»</a>`;
        }
      });
  }

  const initialParams = Object.fromEntries(urlParams);
  initialParams.theloai = urlParams.getAll("theloai[]");
  loadTruyen(initialParams);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const params = {};
    formData.forEach((value, key) => {
      if (key === "theloai[]") {
        params.theloai = params.theloai || [];
        params.theloai.push(value);
      } else {
        params[key] = value;
      }
    });
    params.page = 1;
    window.history.pushState(
      {},
      "",
      `the-loai.html?${new URLSearchParams(params)}`
    );
    loadTruyen(params);
  });

  window.addEventListener("popstate", () => {
    const params = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    params.theloai = new URLSearchParams(window.location.search).getAll(
      "theloai[]"
    );
    loadTruyen(params);
    form.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") {
        input.checked = params.theloai?.includes(input.value);
      } else if (input.type === "radio") {
        input.checked = params[input.name] === input.value;
      }
    });
  });
}
