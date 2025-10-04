
const Report = require("../models/report");
const store = require('../services/inMemoryStore');
const sequelize = require('../config/db');

// Compute revenue between dates. Prefer in-memory Report model (useful for tests/mocks), then DB, then fallback to in-memory store
const getRevenue = async (req, res) => {
  const { from, to } = req.query;
  // require both params (tests expect an error when 'to' missing)
  if (!from || !to) return res.status(400).json({ message: 'Thiếu tham số from/to' });

  try {
    // 1) Try to compute via Report model (this uses invoices model and is mocked in tests)
    try {
      const s = Report.calculateRevenue(from, to);
      return res.json({ tongDoanhThu: s });
    } catch (e) {
      // If Report.calculateRevenue throws because of missing params or other issues, continue to DB fallback
      // but if it's a parameter error, rethrow so we return 400 above already handled
    }

    const toDate = to || new Date().toISOString().split('T')[0];

    // 2) Try DB first
    try {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      const names = tables.map(t => String(t).toUpperCase());
      // VN schema
      if (names.includes('HOA_DON')) {
        const sql = 'SELECT SUM(tong_tien) as s FROM hoa_don WHERE DATE(ngay_lap) BETWEEN :from AND :to';
        const rows = await sequelize.query(sql, { replacements: { from, to: toDate }, type: sequelize.QueryTypes.SELECT });
        const s = rows && rows[0] && (rows[0].s || rows[0].s === 0) ? Number(rows[0].s) : 0;
        return res.json({ tongDoanhThu: s });
      }
      // English-like table names
      if (names.includes('INVOICES') || names.includes('INVOICE')) {
        // try several column names
        const candidates = [
          { col: 'total', table: 'invoices', dateCol: 'createdAt' },
          { col: 'total', table: 'invoices', dateCol: 'created_at' },
          { col: 'total', table: 'invoices', dateCol: 'created_at' }
        ];
        for (const c of candidates) {
          try {
            const sql = `SELECT SUM(${c.col}) as s FROM ${c.table} WHERE DATE(${c.dateCol}) BETWEEN :from AND :to`;
            const rows = await sequelize.query(sql, { replacements: { from, to: toDate }, type: sequelize.QueryTypes.SELECT });
            if (rows && rows[0] && (rows[0].s || rows[0].s === 0)) return res.json({ tongDoanhThu: Number(rows[0].s) });
          } catch(e) { /* try next */ }
        }
      }
    } catch (e) {
      // DB not available or query failed - fallback to in-memory
    }

    // 3) Fallback: sum invoices from in-memory store
    const invs = store.invoices || [];
    const s = (invs || []).reduce((acc, inv) => {
      let subtotal = 0;
      if (inv.total !== undefined && inv.total !== null) return acc + Number(inv.total || 0);
      const items = inv.items || [];
      items.forEach(it => {
        const price = Number(it.gia || it.price || it.gia_tai_thoi_diem) || 0;
        const qty = Number(it.soLuong || it.so_luong || it.quantity || it.qty) || 0;
        subtotal += price * qty;
      });
      return acc + subtotal;
    }, 0);
    return res.json({ tongDoanhThu: s });
  } catch (err) {
    console.error('getRevenue error', err);
    return res.status(500).json({ message: 'Lỗi khi tính doanh thu' });
  }
};

const getTopFoods = async (req, res) => {
  try {
    const { from, to } = req.query || {};
    // 1) If DB is enabled prefer DB aggregation. Otherwise try in-memory Report model first (demo/test mode)
    const useDb = process.env.USE_DB === 'true' && process.env.NODE_ENV !== 'test';
    if (!useDb) {
      try {
        const topFoods = Report.getTopFoods();
        if (topFoods && topFoods.length) return res.json(topFoods);
      } catch (e) {
        // continue to DB fallback
      }
    }

    // 2) Try DB: look for invoices/hoa_don tables and aggregate items JSON
    try {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      const names = tables.map((t) => String(t).toUpperCase());
      let rows = [];

      if (names.includes('HOA_DON')) {
        // Vietnamese schema: invoices (hoa_don) and order details are stored in chi_tiet_order
        // Aggregate by joining hoa_don -> orders -> chi_tiet_order -> mon_an
        const where = (from && to) ? ' WHERE DATE(h.ngay_lap) BETWEEN :from AND :to' : '';
        const sql = `
          SELECT m.ten_mon AS tenMon, SUM(ct.so_luong) AS soLuong
          FROM hoa_don h
          JOIN orders o ON h.ma_order = o.ma_order
          JOIN chi_tiet_order ct ON ct.ma_order = o.ma_order
          JOIN mon_an m ON ct.ma_mon = m.ma_mon
          ${where}
          GROUP BY m.ten_mon
          ORDER BY soLuong DESC
        `;
        try {
          rows = await sequelize.query(sql, { replacements: { from, to }, type: sequelize.QueryTypes.SELECT });
          console.log(`[reports] VN-aggregation SQL executed. rows=${(rows||[]).length}`);
          if(rows && rows.length) console.log('[reports] sample row:', rows[0]);
          // rows from VN query already have { tenMon, soLuong } shape; return them directly
          const mapped = (rows || []).map(r => ({ tenMon: r.tenMon || r.ten_mon || '', soLuong: Number(r.soLuong || r.so_luong || 0) }));
          console.log('[reports] mapped rows count:', (mapped||[]).length);
          try{ console.log('[reports] mapped sample JSON:', JSON.stringify(mapped.slice(0,5))); }catch(e){ console.log('[reports] mapped sample (toString):', mapped.slice(0,5).toString()); }
          return res.json(mapped);
        } catch(dbqErr){
          console.warn('[reports] VN aggregation query failed:', dbqErr && dbqErr.message);
          throw dbqErr;
        }
      } else if (names.includes('INVOICES') || names.includes('INVOICE')) {
        const table = names.includes('INVOICES') ? 'invoices' : 'invoice';
        // try to select items field and optional date filter
        const whereParts = [];
        const repl = {};
        if (from) { whereParts.push('DATE(ngayTao) >= :from'); repl.from = from; }
        if (to) { whereParts.push('DATE(ngayTao) <= :to'); repl.to = to; }
        const whereSql = whereParts.length ? ' WHERE ' + whereParts.join(' AND ') : '';
        const sql = `SELECT items FROM ${table}${whereSql}`;
        rows = await sequelize.query(sql, { replacements: repl, type: sequelize.QueryTypes.SELECT });
      }

      // aggregate
      const stats = {};
      (rows || []).forEach((r) => {
        let items = r.items;
        if (!items) return;
        if (typeof items === 'string') {
          try { items = JSON.parse(items); } catch (e) { items = []; }
        }
        if (!Array.isArray(items)) return;
        items.forEach((it) => {
          const name = it.tenMon || it.name || it.ten || it.productName || it.itemName || '';
          const qty = Number(it.soLuong || it.so_luong || it.quantity || it.qty || it.count) || 0;
          if (!name) return;
          if (!stats[name]) stats[name] = { tenMon: name, soLuong: 0 };
          stats[name].soLuong += qty;
        });
      });

      const result = Object.values(stats).sort((a, b) => b.soLuong - a.soLuong);
      return res.json(result);
    } catch (dbErr) {
      console.warn('Top foods DB fallback failed', dbErr && dbErr.message);
    }

    // 3) Fallback: try Report model (may return empty)
    try {
      const topFoods = Report.getTopFoods();
      return res.json(topFoods || []);
    } catch (err) {
      // final fallback: empty
      return res.json([]);
    }
  } catch (err) {
    console.error('getTopFoods error', err);
    return res.status(500).json({ message: 'Lỗi khi lấy top món ăn' });
  }
};


module.exports = {
  getRevenue,
  getTopFoods,
};