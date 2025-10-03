class Staff {
  constructor(id, { tenNhanVien, gioiTinh, chucVu, trangThaiNV }) {
    this.id = id;
    this.tenNhanVien = tenNhanVien;
    this.gioiTinh = gioiTinh;
    this.chucVu = chucVu;
    this.trangThaiNV = trangThaiNV;
  }
}

module.exports = Staff;
