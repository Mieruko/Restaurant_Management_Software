// Keep tests deterministic by not using DB during NODE_ENV=test
const useDb = process.env.USE_DB === 'true' && process.env.NODE_ENV !== 'test';
let BanModel = null;
if (useDb) {
  try { BanModel = require('../db_models/vn/BanAnVnModel'); } catch (e) { BanModel = null; }
}

let tables = [
  { id: 1, tenBan: "Bàn 1", trangThai: "Trống" },
  { id: 2, tenBan: "Bàn 2", trangThai: "Đang phục vụ" },
];

exports.getTables = async (req, res) => {
  if (useDb && BanModel) {
    try {
      const rows = await BanModel.findAll();
      return res.json(rows.map(r => {
        const vals = r.dataValues || r;
        return { id: vals.ma_ban || vals.id, tenBan: vals.ten_ban || vals.tenBan || ('Bàn ' + (vals.ma_ban || vals.id)), trangThai: vals.tinh_trang || vals.trangThai || null };
      }));
    } catch (e) { return res.status(500).json({ error: 'DB error' }); }
  }
  res.json(tables);
};

// Programmatic accessor used by other modules/tests
exports.getTablesData = async () => {
  if (useDb && BanModel) {
    try {
      const rows = await BanModel.findAll();
      return rows.map(r => {
        const vals = r.dataValues || r;
        return { id: vals.ma_ban || vals.id, tenBan: vals.ten_ban || vals.tenBan || ('Bàn ' + (vals.ma_ban || vals.id)), trangThai: vals.tinh_trang || vals.trangThai || null };
      });
    } catch (e) { return tables; }
  }
  return tables;
};

exports.createTable = async (req, res) => {
  const body = req.body;
  if (useDb && BanModel) {
    try { const created = await BanModel.create({ ten_ban: body.tenBan, so_nguoi: body.soNguoi || null, tinh_trang: body.trangThai || 'Trống', vi_tri: body.viTri || null }); return res.status(201).json(created); } catch(e){ return res.status(500).json({ error: 'DB create error' }); }
  }
  const newTable = { id: tables.length + 1, tenBan: body.tenBan, trangThai: body.trangThai || 'Trống' };
  tables.push(newTable);
  res.status(201).json(newTable);
};

exports.updateTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body;
  if (useDb && BanModel) {
    try {
      const b = await BanModel.findByPk(id);
      if (!b) return res.status(404).json({ message: 'Không tìm thấy bàn' });
      b.ten_ban = body.tenBan || b.ten_ban;
      b.tinh_trang = body.trangThai || b.tinh_trang;
      await b.save();
      return res.json(b);
    } catch(e){ return res.status(500).json({ error: 'DB update error' }); }
  }
  const table = tables.find(t => t.id === id);
  if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });
  Object.assign(table, body);
  res.json(table);
};

exports.deleteTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (useDb && BanModel) {
    try { const d = await BanModel.destroy({ where: { ma_ban: id } }); if (!d) return res.status(404).json({ message: 'Không tìm thấy bàn' }); return res.json({ message: 'Đã xóa bàn' }); } catch(e){ return res.status(500).json({ error: 'DB delete error' }); }
  }
  tables = tables.filter(t => t.id !== id);
  res.json({ message: 'Đã xóa bàn' });
};
