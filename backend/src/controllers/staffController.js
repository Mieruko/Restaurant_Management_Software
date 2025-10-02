const Staff = require("../models/staff");

let staffs = [
  { id: 101, tenNhanVien: "Nguyễn Văn Mười", gioiTinh: "nam", chucVu: "Đầu bếp", trangThaiNV: "Đang làm" },
  { id: 102, tenNhanVien: "Trần Thị Chính", gioiTinh: "nữ", chucVu: "Phục vụ", trangThaiNV: "Đang làm" },
];

exports.getStaff = (req, res) => {
  res.json(staffs);
};

exports.createStaff = (req, res) => {
  const { tenNhanVien, gioiTinh, chucVu, trangThaiNV } = req.body;
  if (!tenNhanVien || !chucVu) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  const nextStaffId = staffs.length > 0 ? Math.max(...staffs.map(s => s.id)) + 1 : 1;
  const newStaff = new Staff(nextStaffId, { tenNhanVien, gioiTinh, chucVu, trangThaiNV });
  staffs.push(newStaff);
  res.status(201).json(newStaff);
};

exports.updateStaff = (req, res) => {
  const staffId = parseInt(req.params.id);
  const staff = staffs.find((t) => t.id === staffId);
  if (!staff) { 
    return res.status(404).json({ message: "Không tìm thấy nhân viên" });
  }

  Object.assign(staff, req.body);
  res.json(staff);
};

exports.deleteStaff = (req, res) => {
  const staffId = parseInt(req.params.id);
  const staff = staffs.find((t) => t.id === staffId);
  if (!staff) {
    return res.status(404).json({ message: "Không tìm thấy nhân viên" });
  }

  staffs = staffs.filter((t) => t.id !== staffId);
  res.json({ message: "Đã xóa nhân viên", deleted: staff });
};