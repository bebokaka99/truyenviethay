console.log("chapter.js loaded");

export function initChapter() {
  console.log("initChapter started, pathname:", window.location.pathname);

  // Kiểm tra đăng nhập (giữ nguyên)
  fetch("http://localhost:888/truyenviethay/api/api.php?action=profile")
    .then((res) => res.json())
    .then((data) => {
      console.log("Profile response:", data);
      if (!data.success) {
        window.location.href =
          data.redirect || "/truyenviethay/users/login.html";
        return;
      }
      document.getElementById("login-btn").style.display = "none";
      document.getElementById("register-btn").style.display = "none";
      document.getElementById("user-info").style.display = "block";
      document.getElementById("user-avatar").src = "../" + data.data.avatar;
    })
    .catch((err) => console.error("Profile error:", err));

  // Load thể loại (giữ nguyên)
  fetch(
    "http://localhost:888/truyenviethay/api/api.php?action=theloai&subaction=categories"
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("Theloai response:", data);
      const theloaiContainer = document.getElementById("theloai-container");
      data.data.forEach((theloai) => {
        theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
      });
      theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
    })
    .catch((err) => console.error("Theloai error:", err));

  const urlParams = new URLSearchParams(window.location.search);
  const truyenId = urlParams.get("truyen_id");
  if (!truyenId || isNaN(truyenId) || truyenId <= 0) {
    console.log("Invalid truyenId:", truyenId);
    document.getElementById("error-message").textContent =
      "Thiếu hoặc sai ID truyện.";
    document.getElementById("error-message").style.display = "block";
    return;
  }
  console.log("truyenId:", truyenId);

  function loadChapters() {
    console.log("Loading chapters for truyenId:", truyenId);
    fetch(
      `http://localhost:888/truyenviethay/api/api.php?action=chapter&truyen_id=${truyenId}`
    )
      .then((res) => {
        console.log("Chapters fetch status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Chapters data:", data);
        if (!data.success) {
          document.getElementById("error-message").textContent = data.error;
          document.getElementById("error-message").style.display = "block";
          return;
        }

        document.getElementById(
          "truyen-title"
        ).textContent = `QUẢN LÝ CHƯƠNG - ${data.ten_truyen}`;
        const actionsContainer = document.getElementById("chapter-actions");
        actionsContainer.innerHTML =
          data.is_author || data.is_admin
            ? `<button class="add-chuong-btn"><i class="fas fa-plus"></i> Thêm chương mới</button>
               <div class="add-chuong-form" id="addChuongForm" style="display: none;">
                   <form id="addChapterForm">
                       <div class="form-header"><h3>Thêm chương mới</h3><button type="button" class="close-form-btn"><i class="fas fa-times"></i></button></div>
                       <div class="form-group"><label for="so_chuong">Số chương:</label><input type="number" name="so_chuong" id="so_chuong" min="1" required></div>
                       <div class="form-group"><label for="tieu_de">Tiêu đề:</label><input type="text" name="tieu_de" id="tieu_de" required></div>
                       <div class="form-group">
                           <label>Upload file:</label>
                           <input type="file" id="upload-file" accept=".pdf,.doc,.docx,.txt" style="display: inline-block; width: auto;">
                           <button type="button" id="upload-file-btn" style="padding: 8px 12px; background: #2196f3; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Upload</button>
                           <span id="upload-spinner" style="display: none; margin-left: 10px;"><i class="fas fa-spinner fa-spin"></i> Đang upload...</span>
                       </div>
                       <div class="form-group">
                           <label for="file-select">Chọn file đã upload:</label>
                           <select id="file-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                               <option value="">-- Chọn file --</option>
                               ${data.files_list
              .map(
                (file) => `
                                   <option value="${file.id}">[${file.format}] ${file.file_path.split("/").pop()} (${file.uploaded_at})</option>
                               `
              )
              .join("")}
                           </select>
                       </div>
                       <div class="form-group">
                           <label for="noi_dung">Nội dung:</label>
                           <textarea name="noi_dung" id="noi_dung"></textarea>
                           <button type="button" id="split-chapters-btn" style="margin-top: 10px; padding: 8px 12px; background: #ff9800; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Tách chương thủ công</button>
                       </div>
                       <div class="form-actions"><button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Thêm chương</button><button type="button" class="cancel-btn"><i class="fas fa-times"></i> Hủy</button></div>
                   </form>
               </div>`
            : "";

        if (data.is_author || data.is_admin) {
          const addBtn = document.querySelector(".add-chuong-btn");
          const formContainer = document.getElementById("addChuongForm");
          const closeBtn = formContainer.querySelector(".close-form-btn");
          const cancelBtn = formContainer.querySelector(".cancel-btn");
          const form = document.getElementById("addChapterForm");
          const uploadBtn = document.getElementById("upload-file-btn");
          const fileInput = document.getElementById("upload-file");
          const fileSelect = document.getElementById("file-select");
          const uploadSpinner = document.getElementById("upload-spinner");
          const splitChaptersBtn =
            document.getElementById("split-chapters-btn");

          // Khởi tạo TinyMCE cho form thêm chương
          tinymce.init({
            selector: "#noi_dung",
            height: 500,
            plugins: "lists link image",
            toolbar: "undo redo | bold italic | bullist numlist | link image",
            setup: (editor) => {
              editor.on("init", () => {
                console.log("TinyMCE initialized for add form");
              });
            },
          });

          addBtn.addEventListener("click", () => {
            formContainer.style.display = "block";
            document.body.classList.add("no-scroll"); // Thêm lớp no-scroll để vô hiệu hóa thanh cuộn của trang
          });
          closeBtn.addEventListener("click", () => {
            formContainer.style.display = "none";
            document.body.classList.remove("no-scroll"); // Xóa lớp no-scroll để khôi phục thanh cuộn
          });
          cancelBtn.addEventListener("click", () => {
            formContainer.style.display = "none";
            document.body.classList.remove("no-scroll"); // Xóa lớp no-scroll để khôi phục thanh cuộn
          });

          // Xử lý upload file
          uploadBtn.addEventListener("click", () => {
            if (!fileInput.files.length) {
              alert("Vui lòng chọn file để upload!");
              return;
            }
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("truyen_id", truyenId);

            uploadSpinner.style.display = "inline";
            uploadBtn.disabled = true;

            fetch("http://localhost:888/truyenviethay/api/upload-story.php", {
              method: "POST",
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => {
                uploadSpinner.style.display = "none";
                uploadBtn.disabled = false;
                if (data.success) {
                  const newOption = new Option(
                    `[${data.file_id}] ${file.name}`,
                    data.file_id
                  );
                  fileSelect.add(newOption);
                  fileSelect.value = data.file_id;
                  fetchFileContent(data.file_id);
                } else {
                  alert(
                    "Upload thất bại: " + (data.error || "Lỗi không xác định")
                  );
                }
              })
              .catch((err) => {
                uploadSpinner.style.display = "none";
                uploadBtn.disabled = false;
                console.error("Upload error:", err);
                alert("Lỗi khi upload file: " + err.message);
              });
          });

          // Xử lý chọn file từ dropdown
          fileSelect.addEventListener("change", () => {
            const fileId = fileSelect.value;
            if (fileId) {
              fetchFileContent(fileId);
            }
          });

          // Hàm lấy nội dung file
          function fetchFileContent(fileId) {
            fetch(
              `http://localhost:888/truyenviethay/api/get-file-content.php?file_id=${fileId}`
            )
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  tinymce
                    .get("noi_dung")
                    .setContent(data.noi_dung_txt.replace(/\n/g, "<br>"));
                } else {
                  alert(
                    "Lỗi khi lấy nội dung file: " +
                    (data.error || "Lỗi không xác định")
                  );
                }
              })
              .catch((err) => {
                console.error("Fetch file content error:", err);
                alert("Lỗi khi lấy nội dung file: " + err.message);
              });
          }

          // Xử lý tách chương thủ công
          splitChaptersBtn.addEventListener("click", () => {
            const content = tinymce
              .get("noi_dung")
              .getContent({ format: "text" });
            if (!content) {
              alert("Nội dung trống, không thể tách chương!");
              return;
            }

            const chapters = content.split(/(Chương\s*\d+\s*:?\s*[^\n]*)/i);
            if (chapters.length <= 1) {
              alert(
                "Không tìm thấy chương để tách. Vui lòng kiểm tra nội dung!"
              );
              return;
            }

            let result = "";
            let currentChapter = "";
            chapters.forEach((part, index) => {
              if (part.match(/Chương\s*\d+\s*:?\s*[^\n]*/i)) {
                if (currentChapter) {
                  result += `<p><strong>${currentChapter}</strong></p><p>${chapters[index - 1]
                    }</p><hr>`;
                }
                currentChapter = part;
              }
            });
            if (currentChapter) {
              result += `<p><strong>${currentChapter}</strong></p><p>${chapters[chapters.length - 1]
                }</p>`;
            }

            tinymce.get("noi_dung").setContent(result);
          });

          // Xử lý submit form
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            formData.append("action", "add");
            formData.append("truyen_id", truyenId);
            const noiDung = tinymce.get("noi_dung").getContent();
            if (!noiDung) {
              alert("Nội dung không được để trống!");
              return;
            }
            formData.set("noi_dung", noiDung);
            fetch(
              "http://localhost:888/truyenviethay/api/api.php?action=chapter",
              {
                method: "POST",
                body: formData,
              }
            )
              .then((res) => res.json())
              .then((data) => {
                handleResponse(data, form, formContainer);
                if (data.success) {
                  document.body.classList.remove("no-scroll"); // Xóa lớp no-scroll khi submit thành công
                }
              })
              .catch((err) => console.error("Add error:", err));
          });
        }

        const tableContainer = document.getElementById(
          "chuong-table-container"
        );
        if (!tableContainer) {
          console.error("Table container not found");
          return;
        }

        if (!data.data.length) {
          tableContainer.innerHTML =
            '<p class="no-data">Chưa có chương nào.</p>';
        } else {
          tableContainer.innerHTML = `
            <table class="chuong-table">
                <thead><tr><th>Số chương</th><th>Tiêu đề</th><th>Ngày đăng</th><th>Trạng thái</th><th>Lượt xem</th><th>Hành động</th></tr></thead>
                <tbody>
                    ${data.data
              .map(
                (chuong) => `
                        <tr>
                            <td>${chuong.so_chuong}</td>
                            <td>${chuong.tieu_de}</td>
                            <td>${chuong.thoi_gian_dang}</td>
                            <td class="status-${chuong.trang_thai}">
                                ${chuong.trang_thai === "cho_duyet"
                    ? "Chờ duyệt"
                    : chuong.trang_thai === "da_duyet"
                      ? "Đã duyệt"
                      : chuong.trang_thai === "tu_choi"
                        ? "Từ chối"
                        : "Không xác định"
                  }
                                ${data.is_author &&
                    chuong.trang_thai === "tu_choi" &&
                    chuong.ly_do_tu_choi
                    ? `<div>Lý do: ${chuong.ly_do_tu_choi}</div>`
                    : ""
                  }
                            </td>
                            <td>${chuong.luot_xem}</td>
                            <td>
                                ${data.is_admin &&
                    chuong.trang_thai === "cho_duyet"
                    ? `
                                    <button class="action-btn approve-btn" data-id="${chuong.id}">Phê duyệt</button>
                                    <button class="action-btn reject-btn" data-id="${chuong.id}">Từ chối</button>
                                    <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                    <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                `
                    : ""
                  }
                                ${data.is_admin &&
                    chuong.trang_thai === "tu_choi"
                    ? `
                                    <button class="action-btn reason-btn" data-reason="${chuong.ly_do_tu_choi}">Xem lý do</button>
                                    <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                    <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                `
                    : ""
                  }
                                ${data.is_admin &&
                    chuong.trang_thai === "da_duyet"
                    ? `
                                    <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                    <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                `
                    : ""
                  }
                                ${data.is_author &&
                    chuong.trang_thai === "cho_duyet"
                    ? `
                                    <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                    <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                `
                    : ""
                  }
                                ${data.is_author &&
                    chuong.trang_thai === "tu_choi"
                    ? `
                                    <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                `
                    : ""
                  }
                                ${data.is_author &&
                    chuong.trang_thai === "da_duyet"
                    ? `
                                    <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                    <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                `
                    : ""
                  }
                            </td>
                        </tr>
                    `
              )
              .join("")}
                </tbody>
            </table>`;

          // Gắn sự kiện
          tableContainer.querySelectorAll(".approve-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const formData = new FormData();
              formData.append("action", "approve");
              formData.append("chapter_id", btn.dataset.id);
              formData.append("truyen_id", truyenId);
              fetch(
                "http://localhost:888/truyenviethay/api/api.php?action=chapter",
                {
                  method: "POST",
                  body: formData,
                }
              )
                .then((res) => res.json())
                .then((data) => handleResponse(data))
                .catch((err) => console.error("Approve error:", err));
            });
          });

          tableContainer.querySelectorAll(".reject-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              console.log("Opening reject form for chapter:", btn.dataset.id);
              openRejectForm(btn.dataset.id);
            });
          });

          tableContainer.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              if (confirm("Bạn có chắc chắn muốn xóa chương này?")) {
                const formData = new FormData();
                formData.append("action", "delete");
                formData.append("chapter_id", btn.dataset.id);
                formData.append("truyen_id", truyenId);
                fetch(
                  "http://localhost:888/truyenviethay/api/api.php?action=chapter",
                  {
                    method: "POST",
                    body: formData,
                  }
                )
                  .then((res) => res.json())
                  .then((data) => handleResponse(data))
                  .catch((err) => console.error("Delete error:", err));
              }
            });
          });

          tableContainer.querySelectorAll(".reason-btn").forEach((btn) => {
            btn.addEventListener("click", () =>
              alert(`Lý do từ chối: ${btn.dataset.reason}`)
            );
          });
        }
      })
      .catch((err) => {
        console.error("Chapters fetch error:", err);
        document.getElementById("error-message").textContent =
          "Lỗi tải danh sách chương.";
        document.getElementById("error-message").style.display = "block";
      });
  }

  // Hàm mở form từ chối
  function openRejectForm(chapterId) {
    const existingForm = document.querySelector(`.reject-form`);
    if (existingForm) {
      console.log("Removing existing reject form");
      existingForm.remove();
    }

    const template = document.getElementById("reject-form-template");
    if (!template) {
      console.error("Reject form template not found");
      return;
    }

    const formClone = template.content
      .cloneNode(true)
      .querySelector(".reject-form");
    const form = formClone.querySelector(".reject-form-submit");
    form.dataset.id = chapterId;

    const closeBtn = formClone.querySelector(".close-form-btn");
    const cancelBtn = formClone.querySelector(".cancel-btn");

    closeBtn.addEventListener("click", () => {
      console.log("Closing reject form");
      formClone.remove();
    });
    cancelBtn.addEventListener("click", () => {
      console.log("Canceling reject form");
      formClone.remove();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const lyDo = form.querySelector('textarea[name="ly_do_tu_choi"]').value;
      if (!lyDo) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
      }
      console.log(
        "Submitting reject for chapter:",
        chapterId,
        "with reason:",
        lyDo
      );
      submitReject(chapterId, lyDo, formClone);
    });

    document.body.appendChild(formClone);
    formClone.style.display = "block";
    console.log("Reject form opened for chapter:", chapterId);
  }

  // Hàm gửi request từ chối
  function submitReject(chapterId, lyDo, formElement) {
    const formData = new FormData();
    formData.append("action", "reject");
    formData.append("chapter_id", chapterId);
    formData.append("truyen_id", truyenId);
    formData.append("ly_do_tu_choi", lyDo);

    fetch("http://localhost:888/truyenviethay/api/api.php?action=chapter", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        console.log("Reject fetch status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Reject response:", data);
        handleResponse(data, null, formElement);
      })
      .catch((err) => console.error("Reject fetch error:", err));
  }

  // Hàm xử lý response
  function handleResponse(data, form = null, formContainer = null) {
    console.log("Handling response:", data);
    const errorDiv = document.getElementById("error-message");
    const successDiv = document.getElementById("success-message");
    errorDiv.style.display = "none";
    successDiv.style.display = "none";

    if (data.success) {
      successDiv.textContent = data.message || "Thành công";
      successDiv.style.display = "block";
      if (form) form.reset();
      if (formContainer) formContainer.style.display = "none";
      loadChapters();
    } else {
      errorDiv.textContent = data.error || "Lỗi không xác định";
      errorDiv.style.display = "block";
    }
  }

  loadChapters();
  console.log("initChapter finished");
}