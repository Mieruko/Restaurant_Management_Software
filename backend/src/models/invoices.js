class Invoice {
  constructor(id, { tableId, items, orderId }) {
    this.id = id;
    this.tableId = tableId;
    this.items = items;
    this.orderId = orderId;
    this.tinhtrangThanhtoan = "Chuẩn bị hoá đơn";
    this.ngayTao = new Date().toISOString().split("T")[0];
  }
}

module.exports = Invoice;
