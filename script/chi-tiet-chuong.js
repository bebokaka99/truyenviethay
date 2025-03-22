export function initChiTietChuong() {
  const state = {
    isEditMode: false,
    truyenId: new URLSearchParams(window.location.search).get("truyen_id"),
    chapterId: new URLSearchParams(window.location.search).get("chapter_id"),
  };

  handleUserProfile();
  loadCategories();
  loadChapterDetails(state);
}

// Xử lý thông tin người dùng
function handleUserProfile() {
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
      updateUserInterface(data.data);
    })
    .catch((error) =>
      handleApiError(
        error,
        document.querySelector(".chi-tiet-chuong-container"),
        "Lỗi khi tải thông tin người dùng"
      )
    );
}

function updateUserInterface(userData) {
  const elements = {
    loginBtn: document.getElementById("login-btn"),
    registerBtn: document.getElementById("register-btn"),
    userInfo: document.getElementById("user-info"),
    userAvatar: document.getElementById("user-avatar"),
  };

  if (elements.loginBtn) elements.loginBtn.style.display = "none";
  if (elements.registerBtn) elements.registerBtn.style.display = "none";
  if (elements.userInfo) elements.userInfo.style.display = "block";
  if (elements.userAvatar && userData.avatar) {
    elements.userAvatar.src = "../" + userData.avatar;
  }
}

// Tải danh sách thể loại
function loadCategories() {
  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const theloaiContainer = document.getElementById("theloai-container");
      if (!theloaiContainer) return;

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        theloaiContainer.innerHTML =
          data.data
            .map(
              (theloai) =>
                `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`
            )
            .join("") +
          `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
      } else {
        theloaiContainer.innerHTML = "<p>Chưa có thể loại nào.</p>";
      }
    })
    .catch((error) =>
      handleApiError(
        error,
        document.getElementById("theloai-container"),
        "Lỗi khi tải thể loại"
      )
    );
}

// Tải chi tiết chương
function loadChapterDetails(state) {
  if (!state.truyenId || !state.chapterId) {
    handleApiError(
      new Error("Invalid ID"),
      document.querySelector(".chi-tiet-chuong-container"),
      "ID không hợp lệ"
    );
    return;
  }

  fetch(
    `/truyenviethay/api/chi-tiet-chuong.php?truyen_id=${state.truyenId}&chapter_id=${state.chapterId}`
  )
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!data.success) {
        handleApiError(
          new Error(data.error),
          document.querySelector(".chi-tiet-chuong-container"),
          "Lỗi từ API"
        );
        return;
      }
      renderChapterDetails(data, state);
    })
    .catch((error) =>
      handleApiError(
        error,
        document.querySelector(".chi-tiet-chuong-container"),
        "Lỗi khi tải chi tiết chương"
      )
    );
}

function renderChapterDetails(data, state) {
  const chapterTitle = document.getElementById("chapter-title");
  const details = document.getElementById("chapter-details");

  if (!chapterTitle || !details) {
    handleApiError(
      new Error("Missing DOM elements"),
      document.querySelector(".chi-tiet-chuong-container"),
      "Lỗi giao diện"
    );
    return;
  }

  chapterTitle.textContent = `CHI TIẾT CHƯƠNG - ${data.ten_truyen}`;
  const trangThai = getChapterStatus(data.chapter);

  details.innerHTML = `
    <h3>
      <span class="static-field">Chương ${data.chapter.so_chuong}: ${
    data.chapter.tieu_de
  }</span>
    </h3>
    <p><strong>Ngày đăng:</strong> ${data.chapter.thoi_gian_dang}</p>
    <p><strong>Lượt xem:</strong> ${data.chapter.luot_xem}</p>
    <p><strong>Trạng thái:</strong> ${trangThai}</p>
    <div class="noi-dung-chuong">
      <h4>Nội Dung</h4>
      <div id="chapter-content" class="chapter-content">${
        data.chapter.noi_dung
      }</div>
    </div>
    <div class="action-buttons">
      ${
        data.is_admin || data.is_author
          ? `
            <button class="edit-btn" id="edit-btn">Chỉnh sửa</button>
            <button class="save-btn" id="save-btn" style="display: none;">Lưu thay đổi</button>
            <button class="cancel-btn" id="cancel-btn" style="display: none;">Hủy</button>
            <button class="delete-btn" id="delete-btn">Xóa chương</button>`
          : ""
      }
      <a href="quan-ly-chuong.html?truyen_id=${
        state.truyenId
      }" class="back-btn">Quay lại</a>
    </div>
  `;

  initializeTinyMCE(data, state);
  attachEventListeners(data, state);
}

function getChapterStatus(chapter) {
  switch (chapter.trang_thai) {
    case "cho_duyet":
      return '<span style="color: orange;">Chờ duyệt</span>';
    case "da_duyet":
      return '<span style="color: green;">Đã duyệt</span>';
    default:
      return `<span style="color: red;">Từ chối${
        chapter.ly_do_tu_choi ? ` (Lý do: ${chapter.ly_do_tu_choi})` : ""
      }</span>`;
  }
}

function initializeTinyMCE(data, state) {
  tinymce.init({
    selector: "#chapter-content",
    inline: true,
    height: 500,
    setup: (editor) => {
      editor.on("init", () => {
        console.log("TinyMCE đã khởi tạo");
        editor.mode.set("design");
      });

      editor.on("focus", () => {
        if ((data.is_admin || data.is_author) && state.isEditMode) {
          editor.mode.set("design");
        }
      });

      editor.on("blur", () => {
        if (!(data.is_admin || data.is_author) || !state.isEditMode) {
          editor.mode.set("readonly");
        }
      });
    },
  });
}

function attachEventListeners(data, state) {
  const elements = {
    editBtn: document.getElementById("edit-btn"),
    saveBtn: document.getElementById("save-btn"),
    cancelBtn: document.getElementById("cancel-btn"),
    deleteBtn: document.getElementById("delete-btn"),
    details: document.getElementById("chapter-details"),
  };

  if (elements.editBtn) {
    elements.editBtn.addEventListener("click", () => {
      state.isEditMode = true;
      elements.details.classList.add("edit-mode");
      elements.editBtn.style.display = "none";
      elements.saveBtn.style.display = "inline-block";
      elements.cancelBtn.style.display = "inline-block";
      const editor = tinymce.get("chapter-content");
      if (editor) {
        editor.setMode("design");
        editor.focus();
      }
    });
  }

  if (elements.saveBtn) {
    const debouncedSave = debounce(
      () => saveChapter(data, state, elements),
      300
    );
    elements.saveBtn.addEventListener("click", debouncedSave);
  }

  if (elements.cancelBtn) {
    elements.cancelBtn.addEventListener("click", () => {
      state.isEditMode = false;
      elements.details.classList.remove("edit-mode");
      elements.editBtn.style.display = "inline-block";
      elements.saveBtn.style.display = "none";
      elements.cancelBtn.style.display = "none";
      const editor = tinymce.get("chapter-content");
      if (editor) {
        editor.setContent(data.chapter.noi_dung);
        editor.setMode("readonly");
      }
    });
  }

  if (elements.deleteBtn) {
    elements.deleteBtn.addEventListener("click", () => {
      if (
        !confirm(
          "Bạn có chắc chắn muốn xóa chương này không? Hành động này không thể hoàn tác."
        )
      )
        return;
      deleteChapter(state);
    });
  }
}

function saveChapter(data, state, elements) {
  if (!confirm("Bạn có chắc chắn muốn lưu thay đổi không?")) return;

  const noiDung = tinymce.get("chapter-content").getContent();

  if (!noiDung) return showError("Nội dung không được để trống!");

  const formData = new FormData();
  formData.append("action", "update");
  formData.append("truyen_id", state.truyenId);
  formData.append("chapter_id", state.chapterId);
  formData.append("noi_dung", noiDung);

  fetch("/truyenviethay/api/chi-tiet-chuong.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        showSuccess(response.message);
        state.isEditMode = false;
        elements.details.classList.remove("edit-mode");
        elements.editBtn.style.display = "inline-block";
        elements.saveBtn.style.display = "none";
        elements.cancelBtn.style.display = "none";
        tinymce.get("chapter-content").setMode("readonly");
      } else {
        showError(response.error);
      }
    })
    .catch((error) => showError(`Lỗi khi lưu: ${error.message}`));
}

function deleteChapter(state) {
  const formData = new FormData();
  formData.append("action", "delete");
  formData.append("truyen_id", state.truyenId);
  formData.append("chapter_id", state.chapterId);

  fetch("/truyenviethay/api/chi-tiet-chuong.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showSuccess(data.message);
        setTimeout(() => {
          window.location.href = `quan-ly-chuong.html?truyen_id=${state.truyenId}`;
        }, 1000);
      } else {
        showError(data.error);
      }
    })
    .catch((error) => showError(`Lỗi khi xóa: ${error.message}`));
}

// Hàm xử lý lỗi chung
function handleApiError(error, container, message) {
  console.error(message, error);
  if (container) {
    container.innerHTML = `<p class="error-message">${message}: ${error.message}. Vui lòng thử lại.</p>`;
  }
}

// Hàm hiển thị thông báo
function showSuccess(message) {
  const successDiv =
    document.getElementById("success-message") ||
    createMessageDiv("success-message", "e7f3e7", "2e7d32");
  successDiv.innerHTML = `${message} <button onclick="this.parentElement.style.display='none'" style="margin-left: 10px; cursor: pointer;">X</button>`;
  successDiv.style.display = "block";
  setTimeout(() => (successDiv.style.display = "none"), 5000);
}

function showError(message) {
  const errorDiv =
    document.getElementById("error-message") ||
    createMessageDiv("error-message", "fdeded", "d32f2f");
  errorDiv.innerHTML = `${message} <button onclick="this.parentElement.style.display='none'" style="margin-left: 10px; cursor: pointer;">X</button>`;
  errorDiv.style.display = "block";
  setTimeout(() => (errorDiv.style.display = "none"), 5000);
}

function createMessageDiv(id, bgColor, textColor) {
  const div = document.createElement("div");
  div.id = id;
  div.style.cssText = `display: none; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 14px; border: 2px solid #2196f3; background: #${bgColor}; color: #${textColor};`;
  document.querySelector(".chi-tiet-chuong-container")?.appendChild(div);
  return div;
}

// Hàm debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
