class Table {
  constructor(id, tenBan, trangThai = "Trống") {
    this.id = id;
    this.tenBan = tenBan;
    this.trangThai = trangThai;
  }
}

module.exports = Table;
