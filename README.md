# Truyenviethay

## Giới thiệu

Truyenviethay là một nền tảng đọc và đăng tải truyện trực tuyến, tập trung vào truyện Việt. Mục đích chính là:

- Cung cấp nơi để người dùng đọc truyện, khám phá truyện mới, theo dõi truyện yêu thích, và tương tác thông qua bình luận hoặc thích truyện.
- Cho phép tác giả đăng tải truyện của mình, quản lý truyện và chương, đồng thời nhận phản hồi từ độc giả.
- Admin có thể quản lý toàn bộ nội dung (truyện, chương, người dùng) và phê duyệt các chương do tác giả đăng tải.
- Hỗ trợ độc giả tìm kiếm nội dung nhanh chóng, lưu lại lịch sử đọc và đề xuất truyện phù hợp.
- Tạo một cộng đồng yêu thích truyện Việt, nơi tác giả và độc giả có thể kết nối với nhau.

## Các chức năng hiện có

### Đối với độc giả

- Đọc truyện (chuong.html), xem chi tiết truyện (chi-tiet-truyen.html), khám phá truyện (kham-pha-ngay.html).
- Tìm kiếm truyện, lọc theo thể loại (the-loai.html), theo dõi truyện, xem lịch sử đọc (lich_su_doc_new).
- Đăng ký (register.html), đăng nhập (login.html), xem và chỉnh sửa thông tin cá nhân (profile.html).

### Đối với tác giả

- Đăng tải truyện mới (quan-ly-truyen.html, quan-ly-truyen-tac-gia.html), thêm chương (tính năng chưa phát triển cần hỗ trợ).
- Quản lý truyện và chương của mình (tính năng chưa phát triển cần hỗ trợ).
- Theo dõi phản hồi của độc giả thông qua bình luận và số lượt thích.

### Đối với admin

- Quản lý toàn bộ truyện (quan-ly-truyen.html), phê duyệt chương, chỉnh sửa hoặc xóa truyện (chưa phát triển cần hỗ trợ).
- Theo dõi hoạt động người dùng, kiểm soát bình luận và xử lý vi phạm.

### Chức năng chung

- Hiển thị trang chủ (index.html), điều hướng chương, tìm kiếm truyện, và các tính năng tương tác (thích, theo dõi, bình luận).
- Hệ thống gợi ý truyện dựa trên sở thích và lịch sử đọc của người dùng (chưa phát triển).

## Các chức năng dự kiến trong tương lai

- **Chế độ đọc ban đêm** - Giúp bảo vệ mắt khi đọc truyện vào ban đêm.
- **Thông báo đẩy** - Cập nhật chương mới cho truyện theo dõi.
- **Hệ thống huy hiệu & thành tựu** - Độc giả có thể nhận huy hiệu khi đọc truyện nhiều.
- **Bảng xếp hạng truyện** - Hiển thị truyện phổ biến theo tuần, tháng, năm.
- **Chế độ tải xuống** - Cho phép người dùng tải chương về để đọc offline.
- **Hỗ trợ API** - Cung cấp API để tích hợp với ứng dụng mobile.
- **Hệ thống donate** - Độc giả có thể ủng hộ tác giả yêu thích.
- **Giao diện cá nhân hóa** - Cho phép người dùng tùy chỉnh màu sắc, font chữ, và bố cục trang đọc.
- **Tích hợp AI gợi ý truyện** - Đề xuất truyện dựa trên sở thích và hành vi đọc của người dùng.
- **Phát triển thành app mobile** - Tích hợp thành app trên mobile hỗ trợ cả android và IOS.

## Cấu trúc thư mục

```
truyenviethay/
│-- api/                # Chứa các api
│-- anh/                # Chứa ảnh bìa truyện, avatar, logo
│-- css/                # Chứa các file CSS thiết kế giao diện
│-- truyen/             # Chứa các file PHP liên quan đến truyện
│-- users/              # Chứa các file PHP liên quan đến người dùng
│-- script/             # Chứa các file JS liên quan đến người dùng
│-- index.html          # Trang chủ
│-- config.php          # Cấu hình database
```

D:\xampp\htdocs\truyenviethay
│── anh\ # Chứa ảnh bìa truyện, avatar, logo, v.v.
│── api\ # Chứa các file API xử lý dữ liệu
│ ├── api.php # Xử lý switch case cho các API khác
│ ├── captcha.php # API tạo captcha tự động cho đăng ký
│ ├── chapter.php # API lấy dữ liệu quản lý chương
│ ├── chi-tiet-chuong.php # API lấy dữ liệu chi tiết chương
│ ├── chi-tiet.php # API lấy dữ liệu chi tiết truyện
│ ├── chuong.php # API xử lý nội dung chương truyện
│ ├── comment.php # API xử lý comment (hiện bị lỗi)
│ ├── db.php # API kết nối và truy vấn database
│ ├── follow-truyen # API lấy dữ liệu trang truyện theo dõi
│ ├── follow.php # API xử lý theo dõi truyện
│ ├── get-file-content.php #
│ ├── lich-su-doc.php # API xử lý lịch sử đọc truyện
│ ├── like.php # API xử lý lượt thích truyện
│ ├── login.php # API xử lý đăng nhập
│ ├── manage-author.php # API quản lý truyện dành cho tác giả
│ ├── manage.php # API quản lý truyện dành cho admin
│ ├── moderation.php # API kiểm duyệt truyện
│ ├── profile.php # API lấy và cập nhật thông tin người dùng
│ ├── register.php # API xử lý đăng ký tài khoản
│ ├── search.php # API xử lý tìm kiếm truyện
│ ├── settings.php # API cập nhật cài đặt người dùng
│ ├── tasks.php # API xử lý nhiệm vụ
│ ├── theloai.php # API lấy danh sách thể loại truyện
│ ├── truyen.php # API lấy danh sách truyện
│ ├── upload-story.php # API xử lý đăng tải truyện dạng tệp
│ ├── upload.php # API xử lý đăng tải truyện
│ ├── user.php # API xử lý thông tin người dùng
│── config.php # Cấu hình kết nối database
│── css\ # Chứa các file CSS thiết kế giao diện
│ ├── chi-tiet-chuong.css # Giao diện chi tiết chương
│ ├── chuong.css # Giao diện đọc chương truyện
│ ├── dang-tai-truyen.css # Giao diện trang đăng tải truyện
│ ├── edit-truyen.css # Giao diện trang chỉnh sửa truyện
│ ├── index.css # Giao diện trang chủ
│ ├── lich-su-doc.css # Giao diện trang lịch sử đọc
│ ├── login.css # Giao diện trang đăng nhập
│ ├── loi-404.css # Giao diện trang lỗi 404
│ ├── profile.css # Giao diện trang thông tin người dùng
│ ├── quan-ly-chuong.css # Giao diện quản lý chương truyện
│ ├── quan-ly-truyen.css # Giao diện quản lý truyện (admin & tác giả)
│ ├── register.css # Giao diện trang đăng ký
│ ├── styles.css # Giao diện tổng thể (header, footer, bố cục)
│ ├── the-loai.css # Giao diện danh sách thể loại
│ ├── truyen-theo-doi.css # Giao diện trang truyện theo dõi
│ ├── truyen.css # Giao diện chi tiết truyện
│ ├── user.css # Giao diện chung cho trang người dùng
│── index.html # Trang chủ website
│── loi-404.html # Trang lỗi 404
│── script\ # Chứa các file JavaScript xử lý logic
│ ├── chapter.js # Xử lý quản lý chương
│ ├── chi-tiet-chuong.js # Xử lý chi tiết chương
│ ├── chi-tiet.js # Xử lý trang chi tiết truyện
│ ├── chuong.js # Xử lý trang đọc chương
│ ├── edit.js # Xử lý chỉnh sửa truyện
│ ├── follow.js # Xử lý theo dõi truyện
│ ├── forms.js # Xử lý biểu mẫu
│ ├── header.js # Xử lý header chung
│ ├── lich-su-doc.js # Xử lý lịch sử đọc
│ ├── login.js # Xử lý đăng nhập
│ ├── manage-author.js # Xử lý quản lý truyện (tác giả)
│ ├── manage.js # Xử lý quản lý truyện (admin)
│ ├── navigation.js # Xử lý các nút điều hướng
│ ├── profile.js # Xử lý trang thông tin người dùng
│ ├── rating.js # Xử lý đánh giá truyện (hiện đang lỗi)
│ ├── register.js # Xử lý đăng ký tài khoản
│ ├── script.js # Xử lý chung cho toàn trang bằng cấu trúc import các init trong của các file script khác
│ ├── search.js # Xử lý tìm kiếm truyện
│ ├── settings.js # Xử lý cài đặt thông tin người dùng
│ ├── slider.js # Xử lý slider truyện nổi bật trên trang chủ
│ ├── tasks.js # Xử lý nhiệm vụ
│ ├── theloai.js # Xử lý thể loại truyện
│ ├── truyen-theo-doi.js # Xử lý truyện theo dõi
│ ├── truyen.js # Xử lý danh sách truyện
│ ├── upload.js # Xử lý đăng tải truyện
│ ├── utils.js # Chứa các hàm tiện ích chung
│── truyen\ # Chứa các file HTML liên quan đến truyện
│ ├── chi-tiet-chuong.html # Hiển thị chi tiết chương
│ ├── chi-tiet-truyen.html # Hiển thị chi tiết truyện
│ ├── chuong.html # Hiển thị nội dung chương
│ ├── dang-tai-truyen.html # Giao diện đăng tải truyện
│ ├── edit-truyen.html # Hiển thị chỉnh sửa truyện
│ ├── quan-ly-chuong.html # Hiển thị quản lý chương
│ ├── quan-ly-truyen-tac-gia.html # Quản lý truyện (tác giả)
│ ├── quan-ly-truyen.html # Quản lý truyện (admin)
│ ├── them-chuong.php # Thêm chương mới
│ ├── the-loai.html # Hiển thị danh sách truyện theo thể loại
│ ├── tim-kiem.html # Hiển thị kết quả tìm kiếm
│── users\ # Chứa các file HTML & PHP liên quan đến người dùng
│ ├── cai-dat-thong-tin.html # Giao diện cài đặt thông tin người dùng
│ ├── lich-su-doc # Hiển thị lịch sử đọc
│ ├── login.html # Giao diện đăng nhập
│ ├── logout.php # Xử lý đăng xuất
│ ├── profile.html # Giao diện trang thông tin cá nhân
│ ├── register.html # Giao diện đăng ký tài khoản
│ ├── truyen-theo-doi.html # Hiển thị truyện theo dõi

## Cụ thể cấu trúc api/api.php (dễ hiểu hơn cấu trúc xử lý logic của các file API/x.php “X là tên file tương ứng”)

<?php
header('Content-Type: application/json');
ob_start(); // Bắt đầu buffer đầu ra

$action = $_GET['action'] ?? 'truyen';
switch ($action) {
    case 'user': require 'user.php'; break;
    case 'theloai': require 'theloai.php'; break;
    case 'truyen': require 'truyen.php'; break;
    case 'chi-tiet': require 'chi-tiet.php'; break;
    case 'follow': require 'follow.php'; break;
    case 'like': require 'like.php'; break;
    case 'comment': require 'comment.php'; break;
    case 'chuong': require 'chuong.php'; break;
    case 'login': require 'login.php'; break;
    case 'register': require 'register.php'; break;
    case 'captcha': require 'captcha.php'; break;
    case 'profile': require 'profile.php'; break;
    case 'tasks': require 'tasks.php'; break;
    case 'moderation': require 'moderation.php'; break;
    case 'moderation_detail': require 'moderation.php'; break; 
    case 'settings': require 'settings.php'; break;
    case 'manage': require 'manage.php'; break;
    case 'edit': require 'edit.php'; break;
    case 'chapter': require 'chapter.php'; break;
    case 'upload': require 'upload.php'; break;
    case 'manage-author': require 'manage-author.php'; break;
    case 'search': require 'search.php'; break;
    case 'chi-tiet-chuong': require 'chi-tiet-chuong.php'; break;
    case 'followed_truyen': require 'follow-truyen.php'; break;

    case 'upload-story': require 'upload-story'; break;
    case 'get-file-content': require 'get-file-content'; break;

    case 'lich-su-doc': require 'lich-su-doc.php'; break;
    case 'xoa-lich-su-doc': require 'lich-su-doc.php'; break;

    default: echo json_encode(['error' => 'Invalid action']);

}
// Xóa buffer và gửi đầu ra
ob_end_flush();
?>

## Cụ thể cấu trúc file script/script.js (cụ thể cấu trúc xử lý logic của các file tại script/x.js “X: là tên file tương ứng”)

import { initSlider } from './slider.js';
import { initHeader } from './header.js';
import { initRating } from './rating.js';
import { initNavigation } from './navigation.js';
import { initForms } from './forms.js';
import { initFollow } from './follow.js';
import { initTasks } from './tasks.js';
import { debugTextarea, reportError } from './utils.js';
import { initTruyen } from './truyen.js';
import { initChiTiet } from './chi-tiet.js';
import { initChuong } from './chuong.js';
import { initLogin } from './login.js';
import { initRegister } from './register.js';
import { initProfile } from './profile.js';
import { initSettings } from './settings.js';
import { initTheLoai } from './theloai.js';
import { initManage } from './manage.js';
import { initEdit } from './edit.js';
import { initChapter } from './chapter.js';
import { initUpload } from './upload.js';
import { initChiTietChuong } from './chi-tiet-chuong.js';
import { initManageAuthor } from './manage-author.js';
import { initSearch } from './search.js';
import { initTruyenTheoDoi } from './truyen-theo-doi.js';
import { initLichSuDoc } from './lich-su-doc.js';

document.addEventListener('DOMContentLoaded', () => {
if (window.location.pathname === '/truyenviethay/' || window.location.pathname.includes('index.html')) {
initSlider();
}

    initTruyen();
    initHeader();
    initRating();
    initNavigation();
    initForms();
    initFollow();
    initTasks();
    debugTextarea();

    if (window.location.pathname.includes('chi-tiet-truyen.html')) initChiTiet();
    if (window.location.pathname.includes('chuong.html')) initChuong();
    if (window.location.pathname.includes('login.html')) initLogin();
    if (window.location.pathname.includes('register.html')) initRegister();
    if (window.location.pathname.includes('profile.html')) initProfile();
    if (window.location.pathname.includes('cai-dat-thong-tin.html')) initSettings();
    if (window.location.pathname.includes('the-loai.html')) initTheLoai();
    if (window.location.pathname.includes('quan-ly-truyen.html')) initManage();
    if (window.location.pathname.includes('edit-truyen.html')) initEdit();
    if (window.location.pathname.includes('quan-ly-chuong.html')) initChapter();
    if (window.location.pathname.includes('dang-tai-truyen.html')) initUpload();
    if (window.location.pathname.includes('chi-tiet-chuong.html')) initChiTietChuong();
    if (window.location.pathname.includes('quan-ly-truyen-tac-gia.html')) initManageAuthor();
    if (window.location.pathname.includes('tim-kiem.html')) initSearch();
    if (window.location.pathname.includes('truyen-theo-doi.html')) initTruyenTheoDoi();
    if (window.location.pathname.includes('lich-su-doc.html')) initLichSuDoc();

    document.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });

    window.reportError = reportError;

});

## Database

Sử dụng MySQL (phpmyadmin) với database `truyenviethay_new`, bao gồm các bảng:
Bảng author_level
Cột trong bảng:
*user_id
Kiểu dữ liệu: INT (int(11))
Mô tả: ID của người dùng, khóa chính
Có thể null: Không (NO)
Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
*exp
Kiểu dữ liệu: INT (int(11))
Mô tả: Điểm kinh nghiệm của tác giả
Có thể null: Có (YES)
*level
Kiểu dữ liệu: INT (int(11))
Mô tả: Cấp độ của tác giả
Có thể null: Có (YES)
*last_updated
Kiểu dữ liệu: DATETIME (datetime)
Mô tả: Thời gian cập nhật cuối cùng
Có thể null: Có (YES)
Đặc điểm: Tự động cập nhật thời gian hiện tại khi có thay đổi (ON UPDATE CURRENT_TIMESTAMP)
Bảng chuong
Cột trong bảng:

- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của chương, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện mà chương thuộc về
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- so_chuong
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Số thứ tự của chương
  Có thể null: Không (NO)
- tieu_de
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Tiêu đề của chương
  Có thể null: Không (NO)
- noi_dung
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Nội dung của chương
  Có thể null: Không (NO)
- thoi_gian_dang
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Thời gian đăng chương
  Có thể null: Có (YES)
- luot_xem
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Số lượt xem của chương
  Có thể null: Có (YES)
- trang_thai
  Kiểu dữ liệu: ENUM (enum('cho_duyet','da_duyet','tu_choi','chuong_mau'...))
  Mô tả: Trạng thái của chương (chờ duyệt, đã duyệt, từ chối, chương mẫu, v.v.)
  Có thể null: Có (YES)
- ly_do_tu_choi
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Lý do từ chối chương (nếu có)
  Có thể null: Có (YES)
- is_chuong_mau
  Kiểu dữ liệu: TINYINT (tinyint(4))
  Mô tả: Xác định chương có phải là chương mẫu không
  Có thể null: Có (YES)
  \*noi_dung_chuong_mau
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Nội dung của chương mẫu (nếu là chương mẫu)
  Có thể null: Có (YES)
  Bảng comments
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của bình luận, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện mà bình luận thuộc về
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng đăng bình luận
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- content
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Nội dung của bình luận
  Có thể null: Không (NO)
- created_at
  Kiểu dữ liệu: TIMESTAMP (timestamp)
  Mô tả: Thời gian tạo bình luận
  Có thể null: Không (NO)
  Bảng daily_tasks
  Cột trong bảng:
- task_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của nhiệm vụ, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- task_name
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Tên của nhiệm vụ
  Có thể null: Không (NO)
- description
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Mô tả chi tiết của nhiệm vụ
  Có thể null: Không (NO)
- exp_reward
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Số điểm kinh nghiệm thưởng khi hoàn thành
  Có thể null: Không (NO)
- task_type
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Loại nhiệm vụ
  Có thể null: Không (NO)
- target
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Mục tiêu cần đạt để hoàn thành nhiệm vụ
  Có thể null: Không (NO)
  Bảng files
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của tệp, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện mà tệp thuộc về
  Có thể null: Không (NO)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng tải tệp lên
  Có thể null: Không (NO)
- file_path
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Đường dẫn đến tệp trên hệ thống
  Có thể null: Không (NO)
- format
  Kiểu dữ liệu: VARCHAR (varchar(10))
  Mô tả: Định dạng của tệp (ví dụ: pdf, docx,...)
  Có thể null: Không (NO)
- uploaded_at
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Thời gian tệp được tải lên
  Có thể null: Không (NO)
  Bảng file_contents
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của bản ghi nội dung, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- file_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của tệp liên quan
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện mà nội dung thuộc về
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng tạo nội dung
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- noi_dung_txt
  Kiểu dữ liệu: LONGTEXT (longtext)
  Mô tả: Nội dung văn bản của tệp
  Có thể null: Có (YES)
- created_at
  Kiểu dữ liệu: TIMESTAMP (timestamp)
  Mô tả: Thời gian tạo bản ghi nội dung
  Có thể null: Không (NO)
  Bảng lich_su_doc_new
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của bản ghi lịch sử, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng đọc truyện
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện được đọc
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- chuong_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của chương được đọc
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- thoi_gian_doc
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Thời gian đọc chương
  Có thể null: Không (NO)
  Bảng theloai_new
  Cột trong bảng:
- id_theloai
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của thể loại, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- ten_theloai
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Tên của thể loại
  Có thể null: Không (NO)
  Đặc điểm: Giá trị duy nhất (UNI)
  Bảng theo_doi
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của bản ghi theo dõi, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng theo dõi truyện
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện được theo dõi
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- ngay_theo_doi
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Ngày bắt đầu theo dõi truyện
  Có thể null: Có (YES)
  Bảng thich
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của bản ghi thích, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng thích truyện
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện được thích
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- ngay_thich
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Ngày người dùng thích truyện
  Có thể null: Có (YES)
  Bảng truyen_new
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người đăng truyện
  Có thể null: Có (YES)
  Đặc điểm: Khóa ngoại (MUL)
- ten_truyen
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Tên của truyện
  Có thể null: Không (NO)
- mo_ta
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Mô tả nội dung truyện
  Có thể null: Có (YES)
- tac_gia
  Kiểu dữ liệu: VARCHAR (varchar(100))
  Mô tả: Tên tác giả của truyện
  Có thể null: Có (YES)
- anh_bia
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Đường dẫn ảnh bìa của truyện
  Có thể null: Có (YES)
- trang_thai
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Trạng thái của truyện
  Có thể null: Có (YES)
  trang_thai_kiem_duyet
  Kiểu dữ liệu: ENUM (enum('duyet','cho_duyet','tu_choi'))
  Mô tả: Trạng thái kiểm duyệt (đã duyệt, chờ duyệt, từ chối)
  Có thể null: Có (YES)
- thoi_gian_cap_nhat
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Thời gian cập nhật truyện
  Có thể null: Có (YES)
- chuong_moi
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Thông tin chương mới nhất
  Có thể null: Có (YES)
- rating
  Kiểu dữ liệu: FLOAT (float)
  Mô tả: Điểm đánh giá trung bình của truyện
  Có thể null: Có (YES)
- luot_xem
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Số lượt xem truyện
  Có thể null: Có (YES)
- is_hot
  Kiểu dữ liệu: TINYINT (tinyint(1))
  Mô tả: Truyện có được đánh dấu là nổi bật không
  Có thể null: Có (YES)
- tinh_trang
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Tình trạng của truyện
  Có thể null: Có (YES)
- luot_thich
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Số lượt thích truyện
  Có thể null: Có (YES)
- luot_theo_doi
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Số lượt theo dõi truyện
  Có thể null: Có (YES)
- trang_thai_viet
  Kiểu dữ liệu: ENUM (enum('dang_tien_hanh','hoan_thanh'))
  Mô tả: Trạng thái viết (đang tiến hành, hoàn thành)
  Có thể null: Có (YES)
- lich_dang
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Lịch đăng truyện
  Có thể null: Có (YES)
- yeu_to_nhay_cam
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Các yếu tố nhạy cảm trong truyện
  Có thể null: Có (YES)
- link_nguon
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Liên kết đến nguồn truyện (nếu có)
  Có thể null: Có (YES)
- muc_tieu
  Kiểu dữ liệu: VARCHAR (varchar(50))
  Mô tả: Mục tiêu của truyện
  Có thể null: Có (YES)
- danh_gia_noi_dung
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Đánh giá nội dung truyện
  Có thể null: Có (YES)
- danh_gia_van_phong
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Đánh giá văn phong của truyện
  Có thể null: Có (YES)
- danh_gia_sang_tao
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Đánh giá sự sáng tạo của truyện
  Có thể null: Có (YES)
- ghi_chu_admin
  Kiểu dữ liệu: TEXT (text)
  Mô tả: Ghi chú từ quản trị viên
  Có thể null: Có (YES)
- doi_tuong_doc_gia
  Kiểu dữ liệu: ENUM (enum('duoi_13','13_16','16_18','18_plus'))
  Mô tả: Đối tượng độc giả mục tiêu (dưới 13, 13-16, 16-18, 18+)
  Có thể null: Có (YES)
  Bảng truyen_theloai
  Bảng truyen_theloai
  Bảng này là bảng trung gian giữa truyen_new và theloai_new, dùng để liên kết truyện với các thể loại của nó.
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của bản ghi liên kết, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- truyen_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của truyện
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
- theloai_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của thể loại
  Có thể null: Không (NO)
  Đặc điểm: Khóa ngoại (MUL)
  Bảng users_new
  Cột trong bảng:
- id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI), tự động tăng (AUTO_INCREMENT)
- username
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Tên đăng nhập của người dùng
  Có thể null: Không (NO)
- password
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Mật khẩu của người dùng
  Có thể null: Không (NO)
- full_name
  Kiểu dữ liệu: VARCHAR (varchar(100))
  Mô tả: Họ và tên đầy đủ của người dùng
  Có thể null: Có (YES)
- email
  Kiểu dữ liệu: VARCHAR (varchar(100))
  Mô tả: Địa chỉ email của người dùng
  Có thể null: Có (YES)
- phone
  Kiểu dữ liệu: VARCHAR (varchar(15))
  Mô tả: Số điện thoại của người dùng
  Có thể null: Có (YES)
- gender
  Kiểu dữ liệu: ENUM (enum('Nam','Nữ','Không xác định'))
  Mô tả: Giới tính của người dùng (Nam, Nữ, Không xác định)
  Có thể null: Có (YES)
- signup_date
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Ngày đăng ký tài khoản
  Có thể null: Có (YES)
- role
  Kiểu dữ liệu: ENUM (enum('user','author','admin'))
  Mô tả: Vai trò của người dùng (user, author, admin)
  Có thể null: Có (YES)
- avatar
  Kiểu dữ liệu: VARCHAR (varchar(255))
  Mô tả: Đường dẫn đến ảnh đại diện của người dùng
  Có thể null: Có (YES)
- created_at
  Kiểu dữ liệu: DATETIME (datetime)
  Mô tả: Thời gian tạo tài khoản
  Có thể null: Có (YES)
  Bảng user_level
  Cột trong bảng:
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI)
- exp
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Điểm kinh nghiệm của người dùng
  Có thể null: Có (YES)
- level
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Cấp độ của người dùng
  Có thể null: Có (YES)
  Bảng user_tasks
  Cột trong bảng:
- user_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của người dùng, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI)
- task_id
  Kiểu dữ liệu: INT (int(11))
  Mô tả: ID của nhiệm vụ, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI)
- last_reset
  Kiểu dữ liệu: DATE (date)
  Mô tả: Ngày cuối cùng đặt lại nhiệm vụ, khóa chính
  Có thể null: Không (NO)
  Đặc điểm: Khóa chính (PRI)
- progress
  Kiểu dữ liệu: INT (int(11))
  Mô tả: Tiến độ hoàn thành nhiệm vụ
  Có thể null: Có (YES)
- is_completed
  Kiểu dữ liệu: TINYINT (tinyint(1))
  Mô tả: Nhiệm vụ đã hoàn thành hay chưa (0: chưa, 1: rồi)
  Có thể null: Có (YES)
- is_rewarded
  Kiểu dữ liệu: TINYINT (tinyint(1))
  Mô tả: Phần thưởng đã được nhận hay chưa (0: chưa, 1: rồi)
  Có thể null: Có (YES)

## Cài đặt và chạy dự án

1. **Clone project về máy**:
   ```sh
   git clone https://github.com/bebokaka99/truyenviethay.git
   ```
2. **Chạy XAMPP và import database**:
   - Khởi động Apache và MySQL trong XAMPP.
   - Import file SQL vào MySQL.
3. **Mở trang web**:
   - Truy cập `http://localhost:888/truyenviethay`

---

© 2025 Truyenviethay - Nền tảng đọc và chia sẻ truyện Việt.

Cái nhìn toàn cảnh về Truyenviethay
Truyenviethay là một nền tảng trực tuyến tập trung vào truyện Việt, kết nối ba nhóm chính:
• Độc giả: Đọc truyện, tìm kiếm, lọc thể loại, theo dõi, xem lịch sử, thích/bình luận, quản lý profile.
• Tác giả: Đăng truyện, thêm/quản lý chương, nhận phản hồi qua lượt thích và bình luận.
• Admin: Quản lý truyện, duyệt chương, chỉnh/xóa nội dung, kiểm soát người dùng.
Tính năng chính
• Hiện có: Đọc, tìm kiếm, theo dõi, tương tác (thích, bình luận), đăng nhập/đăng ký, quản lý truyện cơ bản.
• Đã phát triển thêm: Quản lý chương chi tiết, chỉnh/xóa truyện, gợi ý truyện.
• Chưa xong: Một số tính năng như quản lý chương nâng cao, hệ thống gợi ý truyện hoàn chỉnh.
Tính năng tương lai
• Chế độ đọc ban đêm, thông báo đẩy, bảng xếp hạng, tải offline, donate tác giả, AI gợi ý, app mobile.
Công nghệ & Cấu trúc
• Database: MySQL (truyenviethay_new) với 15 bảng (truyện, chương, người dùng, tương tác,...).
• Backend: PHP, API xử lý qua api/api.php (switch-case).
• Frontend: HTML, CSS, JS (logic tập trung ở script/script.js).
• Thư mục:
text
CollapseWrapCopy
truyenviethay/
├── api/ # API (login, truyen, comment,...)
├── anh/ # Ảnh (bìa, avatar, logo)
├── css/ # Giao diện
├── script/ # Logic JS
├── truyen/ # File truyện
├── users/ # File người dùng
├── config.php # Cấu hình DB
├── index.html # Trang chủ
Mục tiêu
Xây dựng cộng đồng truyện Việt với trải nghiệm đọc mượt mà, hỗ trợ sáng tác và tương tác dễ dàng.
