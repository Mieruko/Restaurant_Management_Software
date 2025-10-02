
const invoices = require("./invoices");

class Report {
  // 📊 Tính tổng doanh thu trong khoảng thời gian
  static calculateRevenue(from, to) {
    if (!from || !to) {
      throw new Error("Thiếu tham số from/to");
    }

    return invoices
      .getAll() // lấy danh sách hóa đơn từ model Invoices
      .filter((inv) => inv.ngayTao >= from && inv.ngayTao <= to)
      .reduce((total, inv) => {
        const subtotal = inv.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return total + subtotal;
      }, 0);
  }

  // 🍲 Lấy top món ăn bán chạy nhất
  static getTopFoods() {
    const stats = {};

    invoices.getAll().forEach((inv) => {
      inv.items.forEach((item) => {
        if (!stats[item.name]) {
          stats[item.name] = { tenMon: item.name, soLuong: 0 };
        }
        stats[item.name].soLuong += item.quantity;
      });
    });

    return Object.values(stats).sort((a, b) => b.soLuong - a.soLuong);
  }
}

module.exports = Report;
