const store = require('../services/inMemoryStore');
// During tests (NODE_ENV === 'test') prefer in-memory stores to avoid flaky DB state
const useDb = process.env.USE_DB === 'true' && process.env.NODE_ENV !== 'test';
let MenuModel = null;
if (useDb) {
  try {
    MenuModel = require('../db_models/MenuModel');
  } catch (e) {
    try {
      MenuModel = require('../db_models/vn/MenuVnModel');
    } catch (er) {
      MenuModel = null;
    }
  }
}

// HTTP handler: returns menu JSON (DB-aware)
exports.getMenu = async (req, res) => {
  try {
    const rows = await exports.getMenuData();
    return res.json(rows);
  } catch (err) {
    console.error('getMenu handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createMenu = async (req, res) => {
  const body = req.body;
  if (useDb) {
    try {
      const model = await resolveMenuModel();
      if (model) {
        const isVn = model.tableName && String(model.tableName).toUpperCase() === 'MON_AN';
        let created;
        if (isVn) {
          created = await model.create({ ten_mon: body.tenMon, gia: body.gia, loai_mon: body.loai });
          const vals = created.dataValues || created;
          return res.status(201).json({ id: vals.ma_mon, tenMon: vals.ten_mon, gia: Number(vals.gia), loai: vals.loai_mon || null });
        }
        created = await model.create({ tenMon: body.tenMon, gia: body.gia, loai: body.loai });
        const vals = created.dataValues || created;
        return res.status(201).json({ id: vals.id || vals.ma_mon, tenMon: vals.tenMon || vals.ten_mon, gia: Number(vals.gia || vals.price), loai: vals.loai || vals.loai_mon || null });
      }
    } catch (err) {
      console.error('MenuModel create error', err);
      return res.status(500).json({ error: 'DB create error' });
    }
  }
  const newItem = { id: store.menu.length + 1, tenMon: body.tenMon, gia: body.gia, loai: body.loai };
  store.menu.push(newItem);
  res.status(201).json(newItem);
};

exports.updateMenu = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body;
  if (useDb) {
    try {
      const model = await resolveMenuModel();
      if (!model) return res.status(500).json({ error: 'DB model not available' });
      const m = await model.findByPk(id);
      if (!m) return res.status(404).json({ message: 'Không tìm thấy món' });
      const isVn = model.tableName && String(model.tableName).toUpperCase() === 'MON_AN';
      if (isVn) {
        m.ten_mon = body.tenMon || m.ten_mon;
        m.gia = body.gia || m.gia;
        m.loai_mon = body.loai || m.loai_mon;
        await m.save();
        const vals = m.dataValues || m;
        return res.json({ id: vals.ma_mon, tenMon: vals.ten_mon, gia: Number(vals.gia), loai: vals.loai_mon || null });
      }
      m.tenMon = body.tenMon || m.tenMon;
      m.gia = body.gia || m.gia;
      m.loai = body.loai || m.loai;
      await m.save();
      const vals = m.dataValues || m;
      return res.json({ id: vals.id || vals.ma_mon, tenMon: vals.tenMon || vals.ten_mon, gia: Number(vals.gia || vals.price), loai: vals.loai || vals.loai_mon || null });
    } catch (err) {
      console.error('MenuModel update error', err);
      return res.status(500).json({ error: 'DB update error' });
    }
  }
  const item = store.menu.find(m => m.id === id);
  if (!item) return res.status(404).json({ message: 'Không tìm thấy món' });
  Object.assign(item, body);
  res.json(item);
};

exports.deleteMenu = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (useDb) {
    try {
      const model = await resolveMenuModel();
      if (!model) return res.status(500).json({ error: 'DB model not available' });
      const isVn = model.tableName && String(model.tableName).toUpperCase() === 'MON_AN';
      const where = isVn ? { ma_mon: id } : { id };
      const deleted = await model.destroy({ where });
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy món' });
      return res.json({ message: 'Đã xóa món ăn' });
    } catch (err) {
      console.error('MenuModel delete error', err);
      return res.status(500).json({ error: 'DB delete error' });
    }
  }
  store.menu = store.menu.filter(m => m.id !== id);
  res.json({ message: 'Đã xóa món ăn' });
};

// Programmatic accessor to menu data (used by other modules)
const sequelize = require('../config/db');
let _menuModelResolved = MenuModel; // may be null
async function resolveMenuModel() {
  if (process.env.USE_DB !== 'true') return null;
  if (_menuModelResolved) return _menuModelResolved;
  try {
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    const names = tables.map(t => String(t).toUpperCase());
    if (names.includes('MON_AN')) {
      try { _menuModelResolved = require('../db_models/vn/MenuVnModel'); return _menuModelResolved; } catch (e) { /* ignore */ }
    }
    if (names.includes('MENUS') || names.includes('MENU')) {
      try { _menuModelResolved = require('../db_models/MenuModel'); return _menuModelResolved; } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // fallback to initially loaded model
  }
  _menuModelResolved = MenuModel;
  return _menuModelResolved;
}

exports.getMenuData = async () => {
  const model = await resolveMenuModel();
  if (process.env.USE_DB === 'true' && model) {
    try {
      const rows = await model.findAll();
      return rows.map(r => {
        const vals = r.dataValues || r;
        if (vals.ten_mon || vals.ma_mon) return { id: vals.ma_mon, tenMon: vals.ten_mon, gia: Number(vals.gia), loai: vals.loai_mon || null };
        return { id: vals.id, tenMon: vals.tenMon || vals.name, gia: vals.gia || vals.price, loai: vals.loai || null };
      });
    } catch (err) {
      if (err && err.original && err.original.code === 'ER_NO_SUCH_TABLE') {
        // try to re-resolve and retry once
        _menuModelResolved = null;
        const retry = await resolveMenuModel();
        if (retry) {
          const rows = await retry.findAll();
          return rows.map(r => {
            const vals = r.dataValues || r;
            if (vals.ten_mon || vals.ma_mon) return { id: vals.ma_mon, tenMon: vals.ten_mon, gia: Number(vals.gia), loai: vals.loai_mon || null };
            return { id: vals.id, tenMon: vals.tenMon || vals.name, gia: vals.gia || vals.price, loai: vals.loai || null };
          });
        }
      }
      console.error('MenuModel read error (accessor)', err);
      return store.menu;
    }
  }
  return store.menu;
};

exports.getTables = (req, res) => {
  res.json(store.tables);
};

exports.getTablesData = () => store.tables;
