# Frontend – Menu, Order, Invoice, Report Module

##  Mục tiêu
Xây dựng giao diện cho các chức năng chính:
- **Menu**: quản lý món ăn (xem danh sách, thêm/sửa/xóa).
- **Order**: gọi món cho bàn, hiển thị danh sách món đã chọn.
- **Invoice**: danh sách hóa đơn, xem chi tiết hóa đơn.
- **Report**: báo cáo doanh thu, top món ăn bán chạy (biểu đồ).

##  Cấu trúc thư mục
frontend/
├── assets/
│ ├── css/style.css
│ ├── js/main.js
│ └── img/
├── components/
│ ├── menuComponent.html
│ ├── orderComponent.html
│ ├── invoiceComponent.html
│ └── reportChart.html
├── pages/
│ ├── menu.html
│ ├── order.html
│ ├── invoice.html
│ └── report.html
└── services/
<<<<<<< HEAD
├── apiMenu.js
├── apiOrder.js
├── apiInvoice.js
└── apiReport.js
git
=======
  ├── apiMenu.js
  ├── apiOrder.js
  ├── apiInvoice.js
  └── apiReport.js

>>>>>>> 8f04b4b4cb3fff7a0f92d4b8e0b6e85912eed03c

## 🚀 Cách chạy
1. Mở từng file HTML trong thư mục `pages/` bằng trình duyệt để xem giao diện.  
<!-- 2. Nếu Backend (BE) đã chạy, mặc định API URL là:
http://localhost:3000/api -->



## 🔗 Kết nối với Backend
### Menu
- `GET /api/menu` → Hiển thị danh sách món.
- `POST /api/menu` → Thêm món mới.
- `PUT /api/menu/:id` → Sửa món.
- `DELETE /api/menu/:id` → Xóa món.

### Order
- `POST /api/orders` → Tạo order mới cho bàn.
- `GET /api/orders/:id` → Lấy chi tiết order.

### Invoice
- `GET /api/invoices` → Lấy danh sách hóa đơn.
- `POST /api/invoices` → Tạo hóa đơn mới.
- `GET /api/invoices/:id` → Lấy chi tiết hóa đơn.

### Report
- `GET /api/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD` → Doanh thu theo thời gian.
- `GET /api/reports/top-foods` → Danh sách món ăn bán chạy.

## ✅ Ghi chú cho team
- Có thể dùng dữ liệu mock trong `main.js` để dựng UI trước khi BE hoàn thành.  
- Đảm bảo **tên field** (id, tenMon, gia, loai, orderId, invoiceId, tongTien…) giống với `docs/api-spec.md`.  
- Trang `report.html` có thể dùng **Chart.js** để vẽ biểu đồ.  
- Sau khi hoàn thiện UI, commit lên branch này rồi tạo Pull Request vào `develop`.
