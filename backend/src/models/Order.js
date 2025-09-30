class Order {
  constructor(id, tableId, items = [], trangThai = "Đang xử lý") {
    this.id = id;
    this.tableId = tableId;
    this.items = items;
    this.trangThai = trangThai;
  }
}

module.exports = Order;
