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