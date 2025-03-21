export function initChiTietChuong() {
  // Xử lý header (ẩn nút Đăng nhập/Đăng ký, hiển thị user info)
  fetch("/truyenviethay/api/api.php?action=profile")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!data.success) {
        window.location.href =
          data.redirect || "/truyenviethay/users/login.html";
        return;
      }
      const loginBtn = document.getElementById("login-btn");
      const registerBtn = document.getElementById("register-btn");
      const userInfo = document.getElementById("user-info");
      const userAvatar = document.getElementById("user-avatar");

      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
      if (userInfo) userInfo.style.display = "block";
      if (userAvatar && data.data.avatar)
        userAvatar.src = "../" + data.data.avatar;
    })
    .catch((error) => {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      const container = document.querySelector(".chi-tiet-chuong-container");
      if (container)
        container.innerHTML = `<p>Lỗi khi tải thông tin người dùng: ${error.message}. Vui lòng thử lại.</p>`;
    });

  // Tải danh sách thể loại cho dropdown
  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const theloaiContainer = document.getElementById("theloai-container");
      if (theloaiContainer && data.success && data.data.length > 0) {
        data.data.forEach((theloai) => {
          theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
        });
        theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
      } else if (theloaiContainer) {
        theloaiContainer.innerHTML = "<p>Chưa có thể loại nào.</p>";
      }
    })
    .catch((error) => {
      console.error("Lỗi khi tải thể loại:", error);
      const theloaiContainer = document.getElementById("theloai-container");
      if (theloaiContainer)
        theloaiContainer.innerHTML = `<p>Lỗi khi tải thể loại: ${error.message}. Vui lòng thử lại.</p>`;
    });

  // Lấy tham số từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const truyenId = urlParams.get("truyen_id");
  const chapterId = urlParams.get("chapter_id");

  if (!truyenId || !chapterId) {
    const container = document.querySelector(".chi-tiet-chuong-container");
    if (container) container.innerHTML = "<p>ID không hợp lệ.</p>";
    return;
  }

  let isEditMode = false; // Biến để theo dõi chế độ chỉnh sửa

  // Tải chi tiết chương từ API
  fetch(
    `/truyenviethay/api/chi-tiet-chuong.php?truyen_id=${truyenId}&chapter_id=${chapterId}`
  )
    .then((res) => {
      console.log("API response status:", res.status);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("API response data:", data);
      const container = document.querySelector(".chi-tiet-chuong-container");
      if (!data.success) {
        if (container) container.innerHTML = `<p>${data.error}</p>`;
        return;
      }

      const chapter = data.chapter;
      const chapterTitle = document.getElementById("chapter-title");
      const details = document.getElementById("chapter-details");

      if (!chapterTitle || !details) {
        console.error(
          "Không tìm thấy #chapter-title hoặc #chapter-details trong DOM"
        );
        if (container)
          container.innerHTML = "<p>Lỗi giao diện, vui lòng thử lại.</p>";
        return;
      }

      chapterTitle.textContent = `CHI TIẾT CHƯƠNG - ${data.ten_truyen}`;
      const trangThai =
        chapter.trang_thai === "cho_duyet"
          ? '<span style="color: orange;">Chờ duyệt</span>'
          : chapter.trang_thai === "da_duyet"
            ? '<span style="color: green;">Đã duyệt</span>'
            : `<span style="color: red;">Từ chối${chapter.ly_do_tu_choi ? ` (Lý do: ${chapter.ly_do_tu_choi})` : ""
            }</span>`;

      // Hiển thị chi tiết chương
      details.innerHTML = `
                <h3>
                    <span class="static-field">Chương ${chapter.so_chuong}: ${chapter.tieu_de
        }</span>
                    <span class="edit-field">
                        Chương <input type="number" id="so-chuong" value="${chapter.so_chuong
        }" min="1">
                        : <input type="text" id="tieu-de" value="${chapter.tieu_de
        }">
                    </span>
                </h3>
                <p><strong>Ngày đăng:</strong> ${chapter.thoi_gian_dang}</p>
                <p><strong>Lượt xem:</strong> ${chapter.luot_xem}</p>
                <p><strong>Trạng thái:</strong> ${trangThai}</p>
                <div class="noi-dung-chuong">
                    <h4>Nội dung:</h4>
                    <div id="chapter-content" class="chapter-content">${chapter.noi_dung
        }</div>
                </div>
                <div class="action-buttons">
                    ${data.is_admin || data.is_author
          ? `<button class="edit-btn" id="edit-btn">Chỉnh sửa</button>
                               <button class="save-btn" id="save-btn" style="display: none;">Lưu thay đổi</button>
                               <button class="cancel-btn" id="cancel-btn" style="display: none;">Hủy</button>
                               <button class="delete-btn" id="delete-btn">Xóa chương</button>`
          : ""
        }
                    <a href="quan-ly-chuong.html?truyen_id=${truyenId}" class="back-btn">Quay lại</a>
                </div>
            `;

      // Khởi tạo TinyMCE cho nội dung chương
      tinymce.init({
        selector: "#chapter-content",
        inline: true, // Sử dụng chế độ inline để không cần textarea
        height: 500,
        plugins:
          "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
        toolbar:
          "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image table | help",
        menubar: false,
        branding: false,
        setup: (editor) => {
          editor.on("init", () => {
            console.log("TinyMCE initialized for chapter content");
            // Đặt chế độ readonly ban đầu
            editor.setMode(
              (data.is_admin || data.is_author) && isEditMode
                ? "design"
                : "readonly"
            );
          });
        },
      });

      // Gắn sự kiện cho các nút
      const editBtn = document.getElementById("edit-btn");
      const saveBtn = document.getElementById("save-btn");
      const cancelBtn = document.getElementById("cancel-btn");
      const deleteBtn = document.getElementById("delete-btn");

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          isEditMode = true;
          details.classList.add("edit-mode");
          editBtn.style.display = "none";
          saveBtn.style.display = "inline-block";
          cancelBtn.style.display = "inline-block";
          tinymce.get("chapter-content").setMode("design");
        });
      }

      if (saveBtn) {
        saveBtn.addEventListener("click", () => {
          if (!confirm("Bạn có chắc chắn muốn lưu thay đổi không?")) return;

          const soChuong = document.getElementById("so-chuong").value;
          const tieuDe = document.getElementById("tieu-de").value.trim();
          const noiDung = tinymce.get("chapter-content").getContent();

          if (!soChuong || soChuong <= 0) {
            showError("Số chương phải là số dương!");
            return;
          }
          if (!tieuDe) {
            showError("Tiêu đề không được để trống!");
            return;
          }
          if (!noiDung) {
            showError("Nội dung không được để trống!");
            return;
          }

          const formData = new FormData();
          formData.append("action", "update");
          formData.append("truyen_id", truyenId);
          formData.append("chapter_id", chapterId);
          formData.append("so_chuong", soChuong);
          formData.append("tieu_de", tieuDe);
          formData.append("noi_dung", noiDung);

          fetch("/truyenviethay/api/chi-tiet-chuong.php", {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                showSuccess(data.message);
                // Cập nhật giao diện
                details.querySelector(
                  ".static-field"
                ).textContent = `Chương ${soChuong}: ${tieuDe}`;
                isEditMode = false;
                details.classList.remove("edit-mode");
                editBtn.style.display = "inline-block";
                saveBtn.style.display = "none";
                cancelBtn.style.display = "none";
                tinymce.get("chapter-content").setMode("readonly");
              } else {
                showError(data.error);
              }
            })
            .catch((error) => {
              showError("Lỗi khi lưu: " + error.message);
            });
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          isEditMode = false;
          details.classList.remove("edit-mode");
          editBtn.style.display = "inline-block";
          saveBtn.style.display = "none";
          cancelBtn.style.display = "none";
          // Reset các giá trị
          document.getElementById("so-chuong").value = chapter.so_chuong;
          document.getElementById("tieu-de").value = chapter.tieu_de;
          tinymce.get("chapter-content").setContent(chapter.noi_dung);
          tinymce.get("chapter-content").setMode("readonly");
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          if (
            !confirm(
              "Bạn có chắc chắn muốn xóa chương này không? Hành động này không thể hoàn tác."
            )
          )
            return;

          const formData = new FormData();
          formData.append("action", "delete");
          formData.append("truyen_id", truyenId);
          formData.append("chapter_id", chapterId);

          fetch("/truyenviethay/api/chi-tiet-chuong.php", {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                showSuccess(data.message);
                setTimeout(() => {
                  window.location.href = `quan-ly-chuong.html?truyen_id=${truyenId}`;
                }, 1000);
              } else {
                showError(data.error);
              }
            })
            .catch((error) => {
              showError("Lỗi khi xóa: " + error.message);
            });
        });
      }
    })
    .catch((error) => {
      console.error("Lỗi khi tải chi tiết chương:", error);
      const container = document.querySelector(".chi-tiet-chuong-container");
      if (container)
        container.innerHTML = `<p>Lỗi khi tải chi tiết chương: ${error.message}. Vui lòng thử lại.</p>`;
    });

  // Hàm hiển thị thông báo thành công
  function showSuccess(message) {
    const successDiv = document.getElementById("success-message");
    successDiv.textContent = message;
    successDiv.style.display = "block";
    setTimeout(() => {
      successDiv.style.display = "none";
    }, 3000);
  }

  // Hàm hiển thị thông báo lỗi
  function showError(message) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 3000);
  }
}
