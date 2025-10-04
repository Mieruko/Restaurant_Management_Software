// Disable DB usage in unit tests to keep tests deterministic
const useDb = process.env.USE_DB === 'true' && process.env.NODE_ENV !== 'test';
let StaffModel = null;
if (useDb) {
  try { StaffModel = require('../db_models/vn/StaffVnModel'); } catch (e) { StaffModel = null; }
}

let staffs = [
  { id: 101, tenNhanVien: "Nguyễn Văn Mười", gioiTinh: "nam", chucVu: "Đầu bếp", trangThaiNV: "Đang làm" },
  { id: 102, tenNhanVien: "Trần Thị Chính", gioiTinh: "nữ", chucVu: "Phục vụ", trangThaiNV: "Đang làm" },
];

exports.getStaff = async (req, res) => {
  if (useDb && StaffModel) {
    try {
      const rows = await StaffModel.findAll();
      const mapped = rows.map(r => {
        const d = r.dataValues || r;
        return {
          id: d.ma_nv || d.id,
          tenNhanVien: d.ten_nv || d.tenNhanVien,
          soDienThoai: d.sdt || d.soDienThoai || null,
          gioiTinh: d.gioi_tinh || d.gioiTinh || null,
          chucVu: d.chuc_vu || d.chucVu || null,
          diaChi: d.dia_chi || d.diaChi || null,
          trangThaiNV: d.trang_thai || d.trangThaiNV || null,
          username: d.username || null
        };
      });
      return res.json(mapped);
    } catch (e) {
      return res.status(500).json({ error: 'DB error' });
    }
  }
  res.json(staffs);
};

exports.createStaff = async (req, res) => {
  const { tenNhanVien, gioiTinh, chucVu, trangThaiNV, username, password_hash } = req.body || {};
  // basic required fields validation
  if (!tenNhanVien || !gioiTinh || !chucVu) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  if (useDb && StaffModel) {
    try {
      const created = await StaffModel.create({ ten_nv: tenNhanVien, gioi_tinh: gioiTinh, chuc_vu: chucVu, trang_thai: trangThaiNV, username, password_hash });
      const d = created.dataValues || created;
      return res.status(201).json({ id: d.ma_nv, tenNhanVien: d.ten_nv, soDienThoai: d.sdt, gioiTinh: d.gioi_tinh, chucVu: d.chuc_vu, diaChi: d.dia_chi, trangThaiNV: d.trang_thai });
    } catch (e) {
      return res.status(500).json({ error: 'DB create error' });
    }
  }
  const nextStaffId = staffs.length > 0 ? Math.max(...staffs.map(s => s.id)) + 1 : 1;
  const newStaff = new (require('../models/staff'))(nextStaffId, { tenNhanVien, gioiTinh, chucVu, trangThaiNV });
  staffs.push(newStaff);
  res.status(201).json(newStaff);
};

exports.updateStaff = async (req, res) => {
  const staffId = parseInt(req.params.id);
  if (useDb && StaffModel) {
    try {
      const s = await StaffModel.findByPk(staffId);
      if (!s) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
      const updates = {};
      if (req.body.tenNhanVien) updates.ten_nv = req.body.tenNhanVien;
      if (req.body.gioiTinh) updates.gioi_tinh = req.body.gioiTinh;
      if (req.body.chucVu) updates.chuc_vu = req.body.chucVu;
      if (req.body.trangThaiNV) updates.trang_thai = req.body.trangThaiNV;
      if (req.body.soDienThoai) updates.sdt = req.body.soDienThoai;
      if (req.body.diaChi) updates.dia_chi = req.body.diaChi;
      await s.update(updates);
      const d = s.dataValues || s;
      return res.json({ id: d.ma_nv, tenNhanVien: d.ten_nv, soDienThoai: d.sdt, gioiTinh: d.gioi_tinh, chucVu: d.chuc_vu, diaChi: d.dia_chi, trangThaiNV: d.trang_thai });
    } catch (e) { return res.status(500).json({ error: 'DB update error' }); }
  }
  const staff = staffs.find((t) => t.id === staffId);
  if (!staff) { return res.status(404).json({ message: 'Không tìm thấy nhân viên' }); }
  Object.assign(staff, req.body);
  res.json(staff);
};

exports.deleteStaff = async (req, res) => {
  const staffId = parseInt(req.params.id);
  if (useDb && StaffModel) {
    try { const d = await StaffModel.destroy({ where: { ma_nv: staffId } }); if (!d) return res.status(404).json({ message: 'Không tìm thấy nhân viên' }); return res.json({ message: 'Đã xóa nhân viên' }); } catch(e){ return res.status(500).json({ error: 'DB delete error' }); }
  }
  const staff = staffs.find((t) => t.id === staffId);
  if (!staff) { return res.status(404).json({ message: 'Không tìm thấy nhân viên' }); }
  staffs = staffs.filter((t) => t.id !== staffId);
  res.json({ message: 'Đã xóa nhân viên', deleted: staff });
};