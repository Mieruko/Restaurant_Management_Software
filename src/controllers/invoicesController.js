const store = require('../services/inMemoryStore');
const dbOrders = (() => {
  try { return require('../services/dbOrders'); } catch (e) { return null; }
})();

// Lazy resolver for invoice model that prefers the table actually present in the DB
const sequelize = require('../config/db');
let _cachedInvoiceModel = undefined; // undefined = not resolved yet, null = no DB model
let _resolvingInvoiceModel = null;
async function getInvoiceModel() {
  // During unit tests, prefer in-memory store to keep tests deterministic
  if (process.env.USE_DB !== 'true' || process.env.NODE_ENV === 'test') return null;
  if (_cachedInvoiceModel !== undefined) return _cachedInvoiceModel;
  if (_resolvingInvoiceModel) return _resolvingInvoiceModel;

  _resolvingInvoiceModel = (async () => {
    let eng = null; let vn = null;
    try { eng = require('../db_models/InvoiceModel'); } catch (e) { eng = null; }
    try { vn = require('../db_models/vn/InvoiceVnModel'); } catch (e) { vn = null; }

    try {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      const names = tables.map(t => String(t).toUpperCase());
      if (names.includes('INVOICES') && eng) { _cachedInvoiceModel = eng; return eng; }
      if (names.includes('HOA_DON') && vn) { _cachedInvoiceModel = vn; return vn; }
      // prefer vn if present, else eng
      _cachedInvoiceModel = vn || eng || null;
      return _cachedInvoiceModel;
    } catch (e) {
      // can't inspect tables — fallback to preferring vn model when present
      _cachedInvoiceModel = vn || eng || null;
      return _cachedInvoiceModel;
    }
  })();

  return _resolvingInvoiceModel;
}

function normalizeInvoiceRow(row){
  // normalize both English and VN invoice row shapes to a common output
  if (!row) return null;
  const vals = row.dataValues || row;
  // Normalize all possible fields to a common output for frontend
  return {
    id: vals.id || vals.ma_hoa_don || vals.maHoaDon,
    createdAt: vals.ngayTao || vals.createdAt || vals.ngay_lap || vals.ngayLap,
    total: vals.total || vals.tong_tien || vals.tongTien,
    status: vals.tinhtrangThanhtoan || vals.tinh_trang_thanh_toan || vals.status,
    phuongThuc: vals.phuongThuc || vals.phuong_thuc || vals.hinhThuc,
    orderId: vals.orderId || vals.ma_order || vals.maOrder,
    tableId: vals.tableId || vals.ma_ban || vals.maBan,
    items: vals.items ? (typeof vals.items === 'string' ? JSON.parse(vals.items) : vals.items) : undefined,
    raw: vals
  };
}

exports.getAllInvoices = async (req, res) => {
  const InvoiceModelResolved = await getInvoiceModel();
  if (InvoiceModelResolved) {
    try {
      let rows;
      // Try VN ordering field then english
      try { rows = await InvoiceModelResolved.findAll({ order: [['ngay_lap', 'DESC']] }); }
      catch (e) { rows = await InvoiceModelResolved.findAll({ order: [['ngayTao', 'DESC']] }).catch(err => { throw err; }); }
      const out = rows.map(normalizeInvoiceRow);
      // Nếu có hóa đơn in-memory, gộp vào đầu danh sách (ưu tiên hiển thị hóa đơn mới tạo)
      if (store.invoices && store.invoices.length > 0) {
        const mem = store.invoices.map(normalizeInvoiceRow);
        return res.json([...mem, ...out]);
      }
      return res.json(out);
    } catch (err) {
      // Nếu DB lỗi, trả về hóa đơn in-memory
      console.error('InvoiceModel read error', err);
      if (store.invoices && store.invoices.length > 0) {
        const mem = store.invoices.map(normalizeInvoiceRow);
        return res.json(mem);
      }
      return res.status(500).json({ error: 'DB error' });
    }
  }
  // Nếu không có model DB, chỉ trả về in-memory
  res.json(store.invoices.map(normalizeInvoiceRow));
};

exports.createInvoice = async (req, res) => {
  const { orderId, tableId, items: payloadItems } = req.body;
  // prepare items list
  let items = payloadItems || [];

  // if DB orders service exists, try to fetch order items from DB
  if (process.env.USE_DB === 'true' && dbOrders) {
    try {
      // dbOrders.listOrdersDB / getOrdersByTableDB return Order models including OrderItems
      let orderRecord = null;
      if (dbOrders.getOrdersByTableDB) {
        // try fetching by id first
        const list = await dbOrders.listOrdersDB();
        orderRecord = list.find(o => String(o.id || o.ma_order) === String(orderId));
      }
      if (!orderRecord && dbOrders.getOrdersByTableDB) {
        const byTable = await dbOrders.getOrdersByTableDB(orderId);
        orderRecord = byTable && byTable.length ? byTable.find(o => String(o.id || o.ma_order) === String(orderId)) : null;
      }
      // Normalize order items if found
      if (orderRecord) {
        const od = orderRecord.dataValues || orderRecord;
        const rawItems = od.OrderItems || od.order_items || od.OrderItem || od.items || od.orderItems || od.CHITIET || [];
        items = (rawItems || []).map(it => {
          const v = it.dataValues || it;
          return { monId: v.monId || v.ma_mon || v.mon_id, tenMon: v.tenMon || v.ten_mon || v.name, gia: v.gia || v.gia_tai_thoi_diem || v.price, soLuong: v.soLuong || v.so_luong || v.quantity || 1 };
        });
      }
      // If still no items found, try a direct get-by-id helper when available
      if ((!items || items.length === 0) && dbOrders.getOrderByIdDB) {
        try {
          const fetched = await dbOrders.getOrderByIdDB(orderId);
          if (fetched) {
            const od = fetched.dataValues || fetched;
            const rawItems = od.OrderItems || od.order_items || od.OrderItem || od.items || od.orderItems || od.CHITIET || [];
            items = (rawItems || []).map(it => {
              const v = it.dataValues || it;
              return { monId: v.monId || v.ma_mon || v.mon_id, tenMon: v.tenMon || v.ten_mon || v.name, gia: v.gia || v.gia_tai_thoi_diem || v.price, soLuong: v.soLuong || v.so_luong || v.quantity || 1 };
            });
          }
        } catch(e) { /* ignore */ }
      }
    } catch (e) {
      // fallback to payloadItems
      items = payloadItems || [];
    }
  }

  const total = (items || []).reduce((s, it) => s + (Number(it.gia) || 0) * (Number(it.soLuong) || 1), 0);

  // If total is zero, attempt a direct DB sum from order items (fallback)
  let computedTotal = total;
  try {
    if ((!computedTotal || computedTotal === 0) && orderId && sequelize) {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      const names = tables.map(t => String(t).toUpperCase());
      // VN schema
      if (names.includes('CHI_Tiet_ORDER'.toUpperCase()) || names.includes('CHI_TIET_ORDER')) {
        // sum gia_tai_thoi_diem * so_luong
        const [rows] = await sequelize.query('SELECT SUM(gia_tai_thoi_diem * so_luong) as s FROM chi_tiet_order WHERE ma_order = :id', { replacements: { id: orderId }, type: sequelize.QueryTypes.SELECT });
        if (rows && (rows.s || rows.s === 0)) computedTotal = Number(rows.s) || 0;
      }
      // English-like fallback table names
      if ((!computedTotal || computedTotal === 0) && (names.includes('ORDER_ITEMS') || names.includes('ORDERITEMS') || names.includes('ORDER_ITEM') || names.includes('ORDERITEM'))) {
        const [rows] = await sequelize.query('SELECT SUM(gia * soLuong) as s FROM OrderItems WHERE orderId = :id', { replacements: { id: orderId }, type: sequelize.QueryTypes.SELECT });
        if (rows && (rows.s || rows.s === 0)) computedTotal = Number(rows.s) || 0;
      }
    }
  } catch(e){ /* ignore fallback errors */ }

  // Use computedTotal if it's > 0
  const finalTotal = (computedTotal && computedTotal > 0) ? computedTotal : total;

  const InvoiceModelResolvedForCreate = await getInvoiceModel();
  if (InvoiceModelResolvedForCreate && process.env.USE_DB === 'true') {
    try {
      // Before creating, check if there is already an invoice for this order
      try {
        const isVnCheck = InvoiceModelResolvedForCreate.tableName && InvoiceModelResolvedForCreate.tableName.toUpperCase() === 'HOA_DON';
        let existing = null;
        if (orderId) {
          if (isVnCheck) {
            existing = await InvoiceModelResolvedForCreate.findOne({ where: { ma_order: orderId } });
          } else {
            existing = await InvoiceModelResolvedForCreate.findOne({ where: { orderId } });
          }
        }
        if (existing) {
          return res.status(409).json({ error: 'Order already has an invoice' });
        }
      } catch (e) {
        // ignore check failures and continue to attempt create
      }
      const isVn = InvoiceModelResolvedForCreate.tableName && InvoiceModelResolvedForCreate.tableName.toUpperCase() === 'HOA_DON';
      let created;
      if (isVn) {
        created = await InvoiceModelResolvedForCreate.create({ ma_order: orderId || null, ma_ban: tableId || null, tong_tien: finalTotal });
        try {
          const OrderVn = require('../db_models/vn/OrderVnModel');
          const ord = await OrderVn.findByPk(orderId);
          if (ord) { ord.tinh_trang_order = 'Đã lập hoá đơn'; await ord.save(); }
        } catch (e) { /* ignore */ }
      } else {
        created = await InvoiceModelResolvedForCreate.create({ orderId, tableId, items: JSON.stringify(items), total: finalTotal });
        try {
          const Order = require('../db_models/OrderModel');
          const ord = await Order.findByPk(orderId);
          if (ord) { ord.trangThai = 'Đã lập hoá đơn'; await ord.save(); }
        } catch (e) { /* ignore */ }
      }
      return res.status(201).json(normalizeInvoiceRow(created));
    } catch (err) {
      // Log full error for debugging
      console.error('create invoice DB error', err && err.stack ? err.stack : err);
      // Fallback for dev: if DB create fails, create in-memory invoice so POS can continue
      if (process.env.NODE_ENV !== 'production') {
        const newInvoice = new (require('../models/invoices'))(store.nextInvoiceId++, { orderId, tableId, items });
        newInvoice.total = total;
        newInvoice.warning = 'DB create failed, saved in-memory as fallback';
        store.invoices.push(newInvoice);
        const order = store.orders.find(o => String(o.id) === String(orderId));
        if (order) order.trangThai = 'Đã lập hoá đơn';
        return res.status(201).json(newInvoice);
      }
      return res.status(500).json({ error: 'DB create error' });
    }
  }

  // fallback to in-memory
  const newInvoice = new (require('../models/invoices'))(store.nextInvoiceId++, { orderId, tableId, items });
  newInvoice.total = total;
  store.invoices.push(newInvoice);
  // if order exists in memory, mark invoiced
  const order = store.orders.find(o => String(o.id) === String(orderId));
  if (order) order.trangThai = 'Đã lập hoá đơn';
  res.status(201).json(newInvoice);
};

exports.getInvoiceById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const InvoiceModelResolvedForGet = await getInvoiceModel();
  if (InvoiceModelResolvedForGet && process.env.USE_DB === 'true') {
    const inv = await InvoiceModelResolvedForGet.findByPk(id);
    if (!inv) return res.status(404).json({ message: 'Không có hoá đơn' });
    return res.json(normalizeInvoiceRow(inv));
  }
  const invoice = store.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ message: 'Không có hoá đơn' });
  res.json(invoice);
};

exports.updateOrder = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const newState = req.body.tinhtrangThanhtoan;
  const InvoiceModelResolvedForUpdate = await getInvoiceModel();
  if (InvoiceModelResolvedForUpdate && process.env.USE_DB === 'true') {
    try {
      const inv = await InvoiceModelResolvedForUpdate.findByPk(id);
      if (!inv) return res.status(404).json({ message: 'Không có hoá đơn' });
      if (inv.tinh_trang_thanh_toan !== undefined) inv.tinh_trang_thanh_toan = newState || inv.tinh_trang_thanh_toan;
      else inv.tinhtrangThanhtoan = newState || inv.tinhtrangThanhtoan;
      await inv.save();
      return res.json(normalizeInvoiceRow(inv));
    } catch (err) {
      console.error('Invoice update error', err);
      return res.status(500).json({ error: 'DB update error' });
    }
  }
  const invoice = store.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ message: 'Không có hoá đơn' });
  invoice.tinhtrangThanhtoan = newState || invoice.tinhtrangThanhtoan;
  res.json(invoice);
};

exports.deleteInvoice = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const InvoiceModelResolvedForDelete = await getInvoiceModel();
  if (InvoiceModelResolvedForDelete && process.env.USE_DB === 'true') {
    try {
      // perform deletion asynchronously to avoid blocking UI; return 202 Accepted now
      res.status(202).json({ message: 'Yêu cầu xóa đang được xử lý' });
      (async () => {
        try {
          const where = (InvoiceModelResolvedForDelete.tableName && InvoiceModelResolvedForDelete.tableName.toUpperCase() === 'HOA_DON') ? { ma_hoa_don: id } : { id };
          const deleted = await InvoiceModelResolvedForDelete.destroy({ where });
          if (!deleted) console.warn('Invoice delete: not found', id);
        } catch (e) { console.error('Async invoice delete error', e); }
      })();
      return;
    } catch (err) {
      console.error('Invoice delete error', err);
      return res.status(500).json({ error: 'DB delete error' });
    }
  }
  const idx = store.invoices.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Không có hoá đơn' });
  const removed = store.invoices.splice(idx, 1)[0];
  res.json({ message: 'Đã xóa hoá đơn', deleted: removed });
};

// Simple payment endpoint: POST /api/invoices/:id/pay
exports.payInvoice = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const method = req.body.method || 'Tiền mặt';
  const InvoiceModelResolvedForUpdate = await getInvoiceModel();
  if (InvoiceModelResolvedForUpdate && process.env.USE_DB === 'true') {
    try {
      const inv = await InvoiceModelResolvedForUpdate.findByPk(id);
      if (!inv) return res.status(404).json({ message: 'Không có hoá đơn' });
      if (inv.tinh_trang_thanh_toan !== undefined) inv.tinh_trang_thanh_toan = 'Đã thanh toán';
      else inv.tinhtrangThanhtoan = 'Đã thanh toán';
      inv.phuong_thuc = method;
      await inv.save();
      return res.json(normalizeInvoiceRow(inv));
    } catch (err) {
      console.error('Invoice pay error', err);
      return res.status(500).json({ error: 'DB update error' });
    }
  }
  const invoice = store.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ message: 'Không có hoá đơn' });
  invoice.tinhtrangThanhtoan = 'Đã thanh toán';
  invoice.phuongThuc = method || 'Tiền mặt';
  // Trả về hóa đơn đã normalize để frontend luôn nhận đúng trường
  res.json(normalizeInvoiceRow(invoice));
};
