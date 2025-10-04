-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 04, 2025 at 01:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanlynhahang`
--

-- --------------------------------------------------------

--
-- Table structure for table `ban_an`
--

CREATE TABLE `ban_an` (
  `ma_ban` int(11) NOT NULL,
  `ten_ban` varchar(50) DEFAULT NULL,
  `so_nguoi` int(11) DEFAULT NULL,
  `tinh_trang` enum('Trống','Đã đặt','Đang sử dụng') DEFAULT 'Trống',
  `vi_tri` varchar(50) DEFAULT NULL,
  `ma_kh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ban_an`
--

INSERT INTO `ban_an` (`ma_ban`, `ten_ban`, `so_nguoi`, `tinh_trang`, `vi_tri`, `ma_kh`) VALUES
(1, 'Bàn 1', 4, 'Đang sử dụng', 'Tầng 1 - Gần cửa', NULL),
(3, 'Bàn 3', 6, 'Trống', 'Tầng 2 - Chính giữa', 2),
(4, 'Bàn 4', NULL, 'Trống', NULL, NULL),
(5, 'Bàn 5', NULL, 'Trống', NULL, NULL),
(6, 'Bàn 6', NULL, 'Đang sử dụng', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_order`
--

CREATE TABLE `chi_tiet_order` (
  `ma_order` int(11) NOT NULL,
  `ma_mon` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `gia_tai_thoi_diem` decimal(12,2) NOT NULL,
  `tinh_trang` enum('Đang chế biến','Đã phục vụ','Đã hủy') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chi_tiet_order`
--

INSERT INTO `chi_tiet_order` (`ma_order`, `ma_mon`, `so_luong`, `gia_tai_thoi_diem`, `tinh_trang`) VALUES
(19, 1, 1, 60000.00, 'Đang chế biến'),
(19, 2, 1, 60000.00, 'Đang chế biến'),
(19, 3, 1, 15000.00, 'Đang chế biến'),
(19, 4, 1, 30000.00, 'Đang chế biến'),
(19, 5, 1, 50000.00, 'Đang chế biến');

-- --------------------------------------------------------

--
-- Table structure for table `hoa_don`
--

CREATE TABLE `hoa_don` (
  `ma_hoa_don` int(11) NOT NULL,
  `ngay_lap` datetime DEFAULT current_timestamp(),
  `tong_tien` decimal(15,2) NOT NULL,
  `tinh_trang_thanh_toan` enum('Chưa thanh toán','Đã thanh toán') DEFAULT 'Chưa thanh toán',
  `phuong_thuc` enum('Tiền mặt','Thẻ','Khác') DEFAULT NULL,
  `ma_order` int(11) DEFAULT NULL,
  `ma_ban` int(11) DEFAULT NULL,
  `ma_kh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoa_don`
--

INSERT INTO `hoa_don` (`ma_hoa_don`, `ngay_lap`, `tong_tien`, `tinh_trang_thanh_toan`, `phuong_thuc`, `ma_order`, `ma_ban`, `ma_kh`) VALUES
(21, '2025-10-04 11:20:45', 0.00, 'Đã thanh toán', 'Tiền mặt', 19, 6, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `khach_hang`
--

CREATE TABLE `khach_hang` (
  `ma_kh` int(11) NOT NULL,
  `ten_kh` varchar(100) NOT NULL,
  `sdt` varchar(20) DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `loai_khach` enum('Vãng lai','Thành viên') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `khach_hang`
--

INSERT INTO `khach_hang` (`ma_kh`, `ten_kh`, `sdt`, `gioi_tinh`, `loai_khach`) VALUES
(1, 'Phạm Thị Hoa', '0909998888', 'Nữ', 'Thành viên'),
(2, 'Nguyễn Văn Nam', '0933334444', 'Nam', 'Vãng lai'),
(3, 'Lý Thị Mai', '0944445555', 'Nữ', 'Thành viên');

-- --------------------------------------------------------

--
-- Table structure for table `mon_an`
--

CREATE TABLE `mon_an` (
  `ma_mon` int(11) NOT NULL,
  `ten_mon` varchar(100) NOT NULL,
  `loai_mon` varchar(50) DEFAULT NULL,
  `gia` decimal(12,2) NOT NULL,
  `tinh_trang` enum('Còn','Hết') DEFAULT 'Còn'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mon_an`
--

INSERT INTO `mon_an` (`ma_mon`, `ten_mon`, `loai_mon`, `gia`, `tinh_trang`) VALUES
(1, 'Phở bò', 'Món chính', 60000.00, 'Còn'),
(2, 'Gà rán', 'Món chính', 60000.00, 'Còn'),
(3, 'Coca Cola', 'Nước uống', 15000.00, 'Còn'),
(4, 'Bánh ngọt', 'Tráng miệng', 30000.00, 'Hết'),
(5, 'Bún chả', 'Món chính', 50000.00, 'Còn'),
(6, 'Bún chả', 'Món chính', 50000.00, 'Còn'),
(7, 'Bún chả', '', 50000.00, 'Còn');

-- --------------------------------------------------------

--
-- Table structure for table `nhan_vien`
--

CREATE TABLE `nhan_vien` (
  `ma_nv` int(11) NOT NULL,
  `ten_nv` varchar(100) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `chuc_vu` varchar(50) DEFAULT NULL,
  `sdt` varchar(20) DEFAULT NULL,
  `dia_chi` varchar(200) DEFAULT NULL,
  `ngay_vao_lam` date DEFAULT NULL,
  `trang_thai` enum('Đang làm','Nghỉ việc') DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhan_vien`
--

INSERT INTO `nhan_vien` (`ma_nv`, `ten_nv`, `ngay_sinh`, `gioi_tinh`, `chuc_vu`, `sdt`, `dia_chi`, `ngay_vao_lam`, `trang_thai`, `username`, `password_hash`) VALUES
(1, 'Nguyễn Văn An', '1995-05-10', 'Nam', 'Quản lý', '0905123456', 'Hà Nội', '2020-01-15', 'Đang làm', 'admin', '$2b$10$qPZnSE3.Cha4f.p8SzSxCOBS1IuFFGMK2k6dDtQ8iTVmHFGv5pJk.'),
(2, 'Trần Thị Bình', '1998-09-20', 'Nữ', 'Phục vụ', '0912345678', 'Hà Nội', '2021-05-01', 'Đang làm', 'binh.tran', '$2b$10$JOWvPKvWKGtdaNkew5udMe/HdDywu6Psu.z1Vks62kNy/r.NFZlSy'),
(3, 'Lê Văn Cường', '1997-07-15', 'Nam', 'Đầu bếp', '0987654321', 'Hà Nội', '2019-09-10', 'Đang làm', 'cuong.le', '$2b$10$8Q99fIYI7QuPaMJDltXut.5HpLoiQwgmr3FBzSBNPxa0aj9w7k7nu'),
(4, 'Phùng Thanh Độ', NULL, 'Nam', 'Đầu bếp', NULL, NULL, NULL, '', NULL, NULL),
(5, '', NULL, 'Nữ', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Phùng Thanh Độ', NULL, 'Nam', 'Đầu bếp', NULL, NULL, NULL, '', NULL, NULL),
(7, '', NULL, 'Nữ', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `ma_order` int(11) NOT NULL,
  `ngay_gio_tao` datetime DEFAULT current_timestamp(),
  `tinh_trang_order` enum('Đang chuẩn bị','Đã phục vụ','Đã hủy') DEFAULT 'Đang chuẩn bị',
  `ma_ban` int(11) DEFAULT NULL,
  `ma_nv` int(11) DEFAULT NULL,
  `ma_kh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`ma_order`, `ngay_gio_tao`, `tinh_trang_order`, `ma_ban`, `ma_nv`, `ma_kh`) VALUES
(19, '2025-10-04 11:20:21', '', 6, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ban_an`
--
ALTER TABLE `ban_an`
  ADD PRIMARY KEY (`ma_ban`),
  ADD KEY `ma_kh` (`ma_kh`);

--
-- Indexes for table `chi_tiet_order`
--
ALTER TABLE `chi_tiet_order`
  ADD PRIMARY KEY (`ma_order`,`ma_mon`),
  ADD KEY `ma_mon` (`ma_mon`);

--
-- Indexes for table `hoa_don`
--
ALTER TABLE `hoa_don`
  ADD PRIMARY KEY (`ma_hoa_don`),
  ADD UNIQUE KEY `ma_order` (`ma_order`),
  ADD KEY `ma_ban` (`ma_ban`),
  ADD KEY `ma_kh` (`ma_kh`);

--
-- Indexes for table `khach_hang`
--
ALTER TABLE `khach_hang`
  ADD PRIMARY KEY (`ma_kh`);

--
-- Indexes for table `mon_an`
--
ALTER TABLE `mon_an`
  ADD PRIMARY KEY (`ma_mon`);

--
-- Indexes for table `nhan_vien`
--
ALTER TABLE `nhan_vien`
  ADD PRIMARY KEY (`ma_nv`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`ma_order`),
  ADD KEY `ma_ban` (`ma_ban`),
  ADD KEY `ma_nv` (`ma_nv`),
  ADD KEY `ma_kh` (`ma_kh`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ban_an`
--
ALTER TABLE `ban_an`
  MODIFY `ma_ban` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hoa_don`
--
ALTER TABLE `hoa_don`
  MODIFY `ma_hoa_don` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `khach_hang`
--
ALTER TABLE `khach_hang`
  MODIFY `ma_kh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mon_an`
--
ALTER TABLE `mon_an`
  MODIFY `ma_mon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `nhan_vien`
--
ALTER TABLE `nhan_vien`
  MODIFY `ma_nv` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `ma_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ban_an`
--
ALTER TABLE `ban_an`
  ADD CONSTRAINT `ban_an_ibfk_1` FOREIGN KEY (`ma_kh`) REFERENCES `khach_hang` (`ma_kh`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `chi_tiet_order`
--
ALTER TABLE `chi_tiet_order`
  ADD CONSTRAINT `chi_tiet_order_ibfk_1` FOREIGN KEY (`ma_order`) REFERENCES `orders` (`ma_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chi_tiet_order_ibfk_2` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON UPDATE CASCADE;

--
-- Constraints for table `hoa_don`
--
ALTER TABLE `hoa_don`
  ADD CONSTRAINT `hoa_don_ibfk_1` FOREIGN KEY (`ma_order`) REFERENCES `orders` (`ma_order`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `hoa_don_ibfk_2` FOREIGN KEY (`ma_ban`) REFERENCES `ban_an` (`ma_ban`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `hoa_don_ibfk_3` FOREIGN KEY (`ma_kh`) REFERENCES `khach_hang` (`ma_kh`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`ma_ban`) REFERENCES `ban_an` (`ma_ban`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`ma_nv`) REFERENCES `nhan_vien` (`ma_nv`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`ma_kh`) REFERENCES `khach_hang` (`ma_kh`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
