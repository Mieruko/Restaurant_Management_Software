// Disable DB usage in unit tests to keep tests deterministic
const useDb = process.env.USE_DB === 'true' && process.env.NODE_ENV !== 'test';
let CustomerModel = null;
if (useDb) {
  try { CustomerModel = require('../db_models/vn/CustomerVnModel'); } catch (e) { CustomerModel = null; }
}

let customers = [
  { id: 1, tenKhach: 'Nguyễn Văn A', soDienThoai: '0900000001', gioiTinh: 'nam', email: 'a@example.com', diaChi: 'Hà Nội', loai: 'Thường' },
  { id: 2, tenKhach: 'Lê Thị B', soDienThoai: '0900000002', gioiTinh: 'nữ', email: 'b@example.com', diaChi: 'Hồ Chí Minh', loai: 'VIP' }
];

exports.getCustomers = async (req, res) => {
  if (useDb && CustomerModel) {
    try {
      const rows = await CustomerModel.findAll();
      // normalize DB rows to API shape
      const mapped = rows.map(r => {
        const d = r.dataValues || r;
        return {
          id: d.ma_kh || d.id,
          tenKhach: d.ten_kh || d.tenKhach || d.name,
          soDienThoai: d.sdt || d.so_dien_thoai || d.phone,
          gioiTinh: d.gioi_tinh || d.gioiTinh,
          email: d.email || null,
          diaChi: d.dia_chi || d.diaChi || null,
          loai: d.loai_khach || d.loai || null
        };
      });
      return res.json(mapped);
    } catch (e) { return res.status(500).json({ error: 'DB error' }); }
  }
  res.json(customers);
};

exports.createCustomer = async (req, res) => {
  const body = req.body || {};
  if (!body.tenKhach || !body.soDienThoai) return res.status(400).json({ message: 'Thiếu tên hoặc SĐT' });
  if (useDb && CustomerModel) {
    try { const created = await CustomerModel.create({ ten_khach: body.tenKhach, so_dien_thoai: body.soDienThoai, gioi_tinh: body.gioiTinh, email: body.email, dia_chi: body.diaChi, loai: body.loai }); return res.status(201).json(created); } catch(e){ return res.status(500).json({ error: 'DB create error' }); }
  }
  const nextId = customers.length ? Math.max(...customers.map(c=>c.id)) + 1 : 1;
  const newC = { id: nextId, tenKhach: body.tenKhach, soDienThoai: body.soDienThoai, gioiTinh: body.gioiTinh || '', email: body.email || '', diaChi: body.diaChi || '', loai: body.loai || 'Thường' };
  customers.push(newC);
  res.status(201).json(newC);
};

exports.updateCustomer = async (req, res) => {
  const id = parseInt(req.params.id,10);
  if (useDb && CustomerModel) {
    try {
      const c = await CustomerModel.findByPk(id);
      if(!c) return res.status(404).json({ message: 'Không tìm thấy khách' });
      // map incoming fields to DB columns when necessary
      const updates = {};
      if (req.body.tenKhach) updates.ten_kh = req.body.tenKhach;
      if (req.body.soDienThoai) updates.sdt = req.body.soDienThoai;
      if (req.body.gioiTinh) updates.gioi_tinh = req.body.gioiTinh;
      if (req.body.loai) updates.loai_khach = req.body.loai;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.diaChi) updates.dia_chi = req.body.diaChi;
      await c.update(updates);
      const d = c.dataValues || c;
      return res.json({ id: d.ma_kh, tenKhach: d.ten_kh, soDienThoai: d.sdt, gioiTinh: d.gioi_tinh, loai: d.loai_khach });
    } catch(e){ return res.status(500).json({ error: 'DB update error' }); }
  }
  const c = customers.find(x=>x.id===id);
  if(!c) return res.status(404).json({ message: 'Không tìm thấy khách' });
  Object.assign(c, req.body);
  res.json(c);
};

exports.deleteCustomer = async (req, res) => {
  const id = parseInt(req.params.id,10);
  if (useDb && CustomerModel) {
    try {
      const d = await CustomerModel.destroy({ where: { ma_kh: id } });
      if(!d) return res.status(404).json({ message: 'Không tìm thấy khách' });
      return res.json({ message: 'Đã xóa' });
    } catch(e){ return res.status(500).json({ error: 'DB delete error' }); }
  }
  const found = customers.find(x=>x.id===id);
  if(!found) return res.status(404).json({ message: 'Không tìm thấy khách' });
  customers = customers.filter(x=>x.id!==id);
  res.json({ message: 'Đã xóa', deleted: found });
};
