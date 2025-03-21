export function initTheLoai() {
  // Tải danh sách thể loại
  let theloaiMap = {};
  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(`Lỗi mạng: ${res.status} - ${text}`);
        });
      }
      return res.json();
    })
    .then((data) => {
      const theloaiOptions = document.getElementById("theloai-options");
      const theloaiContainer = document.getElementById("theloai-container");
      if (!data.success || data.data.length === 0) {
        if (theloaiContainer)
          theloaiContainer.innerHTML = "<p>Chưa có thể loại nào</p>";
        if (theloaiOptions)
          theloaiOptions.innerHTML = "<p>Chưa có thể loại nào để lọc</p>";
      } else {
        data.data.forEach((theloai) => {
          theloaiMap[theloai.id_theloai] = theloai.ten_theloai;
          if (theloaiOptions) {
            theloaiOptions.innerHTML += `
                          <label class="filter-option">
                              <input type="checkbox" name="theloai[]" value="${theloai.id_theloai}">
                              <span>${theloai.ten_theloai}</span>
                          </label>`;
          }
          if (theloaiContainer) {
            theloaiContainer.innerHTML += `<a href="the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
          }
        });
        if (theloaiContainer) {
          theloaiContainer.innerHTML += `<a href="the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
        }
      }
    })
    .catch((error) => {
      console.error("Chi tiết lỗi khi tải thể loại:", error);
      const theloaiContainer = document.getElementById("theloai-container");
      if (theloaiContainer) {
        theloaiContainer.innerHTML =
          "<p>Lỗi khi tải thể loại. Vui lòng thử lại.</p>";
      }
    });

  const form = document.getElementById("filter-form");
  const urlParams = new URLSearchParams(window.location.search);

  if (form) {
    form.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") {
        if (urlParams.getAll("theloai[]").includes(input.value)) {
          input.checked = true;
        }
      } else if (input.type === "radio") {
        if (urlParams.get(input.name) === input.value) {
          input.checked = true;
        }
      }
    });
  }

  function loadTruyen(params) {
    const queryParams = new URLSearchParams();
    for (const key in params) {
      if (key === "theloai" && Array.isArray(params[key])) {
        params[key].forEach((value) => queryParams.append("theloai[]", value));
      } else if (params[key]) {
        queryParams.set(key, params[key]);
      }
    }
    const query = queryParams.toString();

    const truyenList = document.getElementById("truyen-list");
    if (truyenList) {
      truyenList.innerHTML = '<div class="loading-spinner">Đang tải...</div>';
    }

    fetch(`/truyenviethay/api/api.php?action=theloai&${query}`)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Lỗi mạng: ${res.status} - ${text}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Response từ API:", data);
        if (truyenList) {
          if (!data || !data.data) {
            truyenList.innerHTML = "<p>Lỗi dữ liệu từ server.</p>";
            showError("Dữ liệu trả về không hợp lệ.");
            return;
          }
          truyenList.innerHTML = data.data.length
            ? ""
            : "<p>Không tìm thấy truyện phù hợp với bộ lọc.</p>";
          if (!data.success) {
            showError(data.error || "Lỗi khi tải danh sách truyện.");
            return;
          }

          data.data.forEach((truyen) => {
            truyenList.innerHTML += `
                          <div class="khoi-truyen">
                              <a href="chi-tiet-truyen.html?truyen_id=${
                                truyen.id
                              }">
                                  <img src="${truyen.anh_bia}" alt="${
              truyen.ten_truyen
            }" class="anh-truyen" onerror="this.outerHTML='<div class=error-image>Không có ảnh</div>'">
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
          if (pagination) {
            pagination.innerHTML = "";
            const { total, per_page, current_page, total_pages } =
              data.pagination;

            if (current_page > 1) {
              params.page = 1;
              const firstQuery = new URLSearchParams();
              for (const key in params) {
                if (key === "theloai" && Array.isArray(params[key])) {
                  params[key].forEach((value) =>
                    firstQuery.append("theloai[]", value)
                  );
                } else if (params[key]) {
                  firstQuery.set(key, params[key]);
                }
              }
              pagination.innerHTML += `<a href="the-loai.html?${firstQuery}" class="page-link">Trang đầu</a>`;
            }

            if (current_page > 1) {
              params.page = current_page - 1;
              const prevQuery = new URLSearchParams();
              for (const key in params) {
                if (key === "theloai" && Array.isArray(params[key])) {
                  params[key].forEach((value) =>
                    prevQuery.append("theloai[]", value)
                  );
                } else if (params[key]) {
                  prevQuery.set(key, params[key]);
                }
              }
              pagination.innerHTML += `<a href="the-loai.html?${prevQuery}" class="page-link">«</a>`;
            }

            for (let i = 1; i <= total_pages; i++) {
              params.page = i;
              const pageQuery = new URLSearchParams();
              for (const key in params) {
                if (key === "theloai" && Array.isArray(params[key])) {
                  params[key].forEach((value) =>
                    pageQuery.append("theloai[]", value)
                  );
                } else if (params[key]) {
                  pageQuery.set(key, params[key]);
                }
              }
              pagination.innerHTML += `<a href="the-loai.html?${pageQuery}" class="page-link ${
                i === current_page ? "active" : ""
              }">${i}</a>`;
            }

            if (current_page < total_pages) {
              params.page = current_page + 1;
              const nextQuery = new URLSearchParams();
              for (const key in params) {
                if (key === "theloai" && Array.isArray(params[key])) {
                  params[key].forEach((value) =>
                    nextQuery.append("theloai[]", value)
                  );
                } else if (params[key]) {
                  nextQuery.set(key, params[key]);
                }
              }
              pagination.innerHTML += `<a href="the-loai.html?${nextQuery}" class="page-link">»</a>`;
            }

            if (current_page < total_pages) {
              params.page = total_pages;
              const lastQuery = new URLSearchParams();
              for (const key in params) {
                if (key === "theloai" && Array.isArray(params[key])) {
                  params[key].forEach((value) =>
                    lastQuery.append("theloai[]", value)
                  );
                } else if (params[key]) {
                  lastQuery.set(key, params[key]);
                }
              }
              pagination.innerHTML += `<a href="the-loai.html?${lastQuery}" class="page-link">Trang cuối</a>`;
            }
          }

          displaySelectedFilters(params, theloaiMap);
        }
      })
      .catch((error) => {
        console.error("Chi tiết lỗi khi tải danh sách truyện:", error);
        showError("Lỗi khi tải danh sách truyện: " + error.message);
        if (truyenList) {
          truyenList.innerHTML =
            "<p>Lỗi khi tải danh sách truyện. Vui lòng thử lại.</p>";
        }
      });
  }

  function displaySelectedFilters(params, theloaiMap) {
    const selectedFilters = document.getElementById("selected-filters");
    if (!selectedFilters) return;

    selectedFilters.innerHTML = "";
    let hasFilters = false;

    if (params.theloai && params.theloai.length > 0) {
      hasFilters = true;
      params.theloai.forEach((id) => {
        const tenTheLoai = theloaiMap[id] || "Thể loại không xác định";
        selectedFilters.innerHTML += `
                  <span class="selected-filter">
                      Thể loại: ${tenTheLoai}
                      <button class="remove-filter" data-type="theloai" data-value="${id}">×</button>
                  </span>`;
      });
    }

    if (params.trang_thai) {
      hasFilters = true;
      selectedFilters.innerHTML += `
              <span class="selected-filter">
                  Tình trạng: ${params.trang_thai}
                  <button class="remove-filter" data-type="trang_thai">×</button>
              </span>`;
    }

    if (params.rating) {
      hasFilters = true;
      selectedFilters.innerHTML += `
              <span class="selected-filter">
                  Xếp hạng: ${params.rating} sao
                  <button class="remove-filter" data-type="rating">×</button>
              </span>`;
    }

    if (params.sort && params.sort !== "thoi_gian_cap_nhat_desc") {
      hasFilters = true;
      const sortText =
        {
          name_asc: "Tên A-Z",
          rating_desc: "Rating cao",
          top_day: "Top ngày",
          top_week: "Top tuần",
          top_month: "Top tháng",
          top_year: "Top năm",
        }[params.sort] || "Mới cập nhật";
      selectedFilters.innerHTML += `
              <span class="selected-filter">
                  Sắp xếp: ${sortText}
                  <button class="remove-filter" data-type="sort">×</button>
              </span>`;
    }

    selectedFilters.style.display = hasFilters ? "block" : "none";

    document.querySelectorAll(".remove-filter").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.getAttribute("data-type");
        const value = button.getAttribute("data-value");
        const newParams = { ...params };

        if (type === "theloai") {
          newParams.theloai = newParams.theloai.filter((id) => id !== value);
          if (form) {
            const checkbox = form.querySelector(
              `input[name="theloai[]"][value="${value}"]`
            );
            if (checkbox) checkbox.checked = false;
          }
        } else if (type === "sort") {
          newParams.sort = "thoi_gian_cap_nhat_desc";
          if (form) {
            const sortInput = form.querySelector(
              `input[name="sort"][value="thoi_gian_cap_nhat_desc"]`
            );
            if (sortInput) sortInput.checked = true;
          }
        } else {
          delete newParams[type];
          if (form) {
            const input = form.querySelector(`input[name="${type}"]:checked`);
            if (input) input.checked = false;
          }
        }

        newParams.page = 1;
        const queryParams = new URLSearchParams();
        for (const key in newParams) {
          if (key === "theloai" && Array.isArray(newParams[key])) {
            newParams[key].forEach((value) =>
              queryParams.append("theloai[]", value)
            );
          } else if (newParams[key]) {
            queryParams.set(key, newParams[key]);
          }
        }
        window.history.pushState({}, "", `the-loai.html?${queryParams}`);
        loadTruyen(newParams);
      });
    });
  }

  const initialParams = {
    theloai: urlParams.getAll("theloai[]"),
    trang_thai: urlParams.get("trang_thai") || "",
    rating: urlParams.get("rating") || "",
    sort: urlParams.get("sort") || "thoi_gian_cap_nhat_desc",
    page: urlParams.get("page") || 1,
  };
  loadTruyen(initialParams);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const params = {
        theloai: formData.getAll("theloai[]"),
        trang_thai: formData.get("trang_thai") || "",
        rating: formData.get("rating") || "",
        sort: formData.get("sort") || "thoi_gian_cap_nhat_desc",
        page: 1,
      };

      const queryParams = new URLSearchParams();
      for (const key in params) {
        if (key === "theloai" && Array.isArray(params[key])) {
          params[key].forEach((value) =>
            queryParams.append("theloai[]", value)
          );
        } else if (params[key]) {
          queryParams.set(key, params[key]);
        }
      }
      window.history.pushState({}, "", `the-loai.html?${queryParams}`);
      loadTruyen(params);
    });
  }

  window.addEventListener("popstate", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
      theloai: urlParams.getAll("theloai[]"),
      trang_thai: urlParams.get("trang_thai") || "",
      rating: urlParams.get("rating") || "",
      sort: urlParams.get("sort") || "thoi_gian_cap_nhat_desc",
      page: urlParams.get("page") || 1,
    };
    loadTruyen(params);

    if (form) {
      form.querySelectorAll("input").forEach((input) => {
        if (input.type === "checkbox") {
          input.checked = params.theloai.includes(input.value);
        } else if (input.type === "radio") {
          input.checked = params[input.name] === input.value;
        }
      });
    }
  });

  function showError(message) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 3000);
    }
  }
}
