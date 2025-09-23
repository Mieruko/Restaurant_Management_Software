-- Tạo database 
CREATE DATABASE QuanLyNhaHang; 
USE QuanLyNhaHang; 
 -- Bảng Nhân viên 
CREATE TABLE NHAN_VIEN ( 
    ma_nv INT AUTO_INCREMENT PRIMARY KEY, 
    ten_nv VARCHAR(100) NOT NULL, 
    ngay_sinh DATE, 
    gioi_tinh ENUM('Nam','Nữ','Khác'), 
    chuc_vu VARCHAR(50), 
    sdt VARCHAR(20), 
    dia_chi VARCHAR(200), 
    ngay_vao_lam DATE, 
    trang_thai ENUM('Đang làm','Nghỉ việc'), 
    username VARCHAR(50) UNIQUE, 
    password_hash VARCHAR(255) 
); 
 -- Bảng Khách hàng 
CREATE TABLE KHACH_HANG ( 
    ma_kh INT AUTO_INCREMENT PRIMARY KEY, 
    ten_kh VARCHAR(100) NOT NULL, 
    sdt VARCHAR(20), 
    gioi_tinh ENUM('Nam','Nữ','Khác'), 
    loai_khach ENUM('Vãng lai','Thành viên') 
); 
 -- Bảng Món ăn 
CREATE TABLE MON_AN ( 
    ma_mon INT AUTO_INCREMENT PRIMARY KEY, 
    ten_mon VARCHAR(100) NOT NULL, 
    loai_mon VARCHAR(50), 
    gia DECIMAL(12,2) NOT NULL, 
    tinh_trang ENUM('Còn','Hết') DEFAULT 'Còn' 
); 
 -- Bảng Bàn ăn 
CREATE TABLE BAN_AN ( 
    ma_ban INT AUTO_INCREMENT PRIMARY KEY, 
    ten_ban VARCHAR(50), 
    so_nguoi INT, 
    tinh_trang ENUM('Trống','Đã đặt','Đang sử dụng') DEFAULT 'Trống', 
    vi_tri VARCHAR(50), 
    ma_kh INT, 
    FOREIGN KEY (ma_kh) REFERENCES KHACH_HANG(ma_kh) 
); 
 
-- Bảng Order 
CREATE TABLE `ORDERS` ( 
    ma_order INT AUTO_INCREMENT PRIMARY KEY, 
    ngay_gio_tao DATETIME DEFAULT CURRENT_TIMESTAMP, 
    tinh_trang_order ENUM('Đang chuẩn bị','Đã phục vụ','Đã hủy') DEFAULT 'Đang chuẩn bị', 
    ma_ban INT, 
    ma_nv INT, 
    ma_kh INT, 
    FOREIGN KEY (ma_ban) REFERENCES BAN_AN(ma_ban), 
    FOREIGN KEY (ma_nv) REFERENCES NHAN_VIEN(ma_nv), 
    FOREIGN KEY (ma_kh) REFERENCES KHACH_HANG(ma_kh) 
); 
 -- Bảng Chi tiết Order 
CREATE TABLE CHI_TIET_ORDER ( 
    ma_order INT, 
    ma_mon INT, 
    so_luong INT NOT NULL, 
    gia_tai_thoi_diem DECIMAL(12,2) NOT NULL, 
    tinh_trang ENUM('Đang chế biến','Đã phục vụ','Đã hủy'), 
    PRIMARY KEY (ma_order, ma_mon), 
    FOREIGN KEY (ma_order) REFERENCES `ORDERS`(ma_order), 
    FOREIGN KEY (ma_mon) REFERENCES MON_AN(ma_mon) 
); 
 -- Bảng Hóa đơn 
CREATE TABLE HOA_DON ( 
    ma_hoa_don INT AUTO_INCREMENT PRIMARY KEY, 
    ngay_lap DATETIME DEFAULT CURRENT_TIMESTAMP, 
    tong_tien DECIMAL(15,2) NOT NULL, 
    tinh_trang_thanh_toan ENUM('Chưa thanh toán','Đã thanh toán') DEFAULT 'Chưa thanh toán', 
    phuong_thuc ENUM('Tiền mặt','Thẻ','Khác'), 
    ma_order INT UNIQUE, 
    ma_ban INT, 
    ma_kh INT, 
    FOREIGN KEY (ma_order) REFERENCES `ORDERS`(ma_order), 
    FOREIGN KEY (ma_ban) REFERENCES BAN_AN(ma_ban), 
    FOREIGN KEY (ma_kh) REFERENCES KHACH_HANG(ma_kh) 
); 
