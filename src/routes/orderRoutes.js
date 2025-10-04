const express = require("express");
const menuController = require('../controllers/menuController');
const router = express.Router();

// Helper: normalize a raw DB order (Sequelize instance or plain object) to the API shape
function normalizeDbOrder(vals, menuData){
  const v = vals.dataValues || vals;
  const itemsRaw = v.OrderItems || v.order_items || v.CHI_TIET_ORDERs || [];
  const items = (itemsRaw || []).map(it => {
    const vv = it.dataValues || it;
    return {
      monId: vv.ma_mon || vv.monId || vv.mon_id || vv.id,
      // expose an item-level identifier: for EN use numeric id, for VN use composite ma_order_ma_mon
      itemId: vv.id || (vv.ma_order && vv.ma_mon ? `${vv.ma_order}_${vv.ma_mon}` : undefined),
      tenMon: vv.ten_mon || vv.tenMon || null,
      soLuong: vv.so_luong || vv.soLuong || vv.quantity || 1,
      gia: vv.gia_tai_thoi_diem || vv.gia || vv.price || null,
      status: vv.tinh_trang || vv.status || 'Chưa chế biến'
    };
  });
  // try to enrich from menuData
  if(menuData){
    for(const it of items){
      if(!it.tenMon){
        const m = (menuData||[]).find(mm => String(mm.id) === String(it.monId) || String(mm.id) === String(it.ma_mon));
        if(m){ it.tenMon = m.tenMon || m.ten_mon || it.tenMon; it.gia = it.gia || m.gia || m.price || it.gia; }
      }
    }
  }
  return {
    id: v.ma_order || v.id,
    tableId: v.ma_ban || v.tableId || null,
    createdAt: v.ngay_gio_tao || v.createdAt || null,
    trangThai: v.tinh_trang_order || v.trangThai || null,
    items
  };
}

let orders = [];
let orderId = 1;
// Use DB only when explicitly enabled and not running unit tests
const useDb = process.env.USE_DB === 'true' && process.env.NODE_ENV !== 'test';

// GET all orders (used by frontend to list orders)
router.get('/', async (req, res) => {
  if (useDb) {
    try {
      const db = require('../services/dbOrders');
      const list = await db.listOrdersDB();
      const menuData = await menuController.getMenuData();
      const normalized = (list || []).map(o => normalizeDbOrder(o, menuData));
      return res.json(normalized);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
  }
  res.json(orders);
});

// POST new order
router.post('/', async (req, res) => {
  const raw = req.body || {};
  // Coerce tableId from possible variants
  const tableId = raw.tableId !== undefined ? Number(raw.tableId) : (raw.ma_ban !== undefined ? Number(raw.ma_ban) : undefined);
  if (!tableId || Number.isNaN(tableId)) return res.status(400).json({ error: 'Invalid tableId' });

  // Coerce items from possible keys
  const itemsArr = Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.cart) ? raw.cart : []);
  if (!itemsArr || !itemsArr.length) return res.status(400).json({ error: 'Order must contain at least one item' });

  const normalizedItems = itemsArr.map(it => {
    const monId = it.monId !== undefined ? Number(it.monId) : (it.ma_mon !== undefined ? Number(it.ma_mon) : (it.id !== undefined ? Number(it.id) : undefined));
    // accept multiple quantity field names: quantity, so_luong (snake), soLuong (camel)
    const quantity = it.quantity !== undefined ? Number(it.quantity) : (it.so_luong !== undefined ? Number(it.so_luong) : (it.soLuong !== undefined ? Number(it.soLuong) : 1));
    const soLuong = quantity; // provide both shapes for downstream consumers
    return { monId, quantity, soLuong };
  }).filter(it => it.monId && !Number.isNaN(it.monId) && it.quantity > 0);
  if (!normalizedItems.length) return res.status(400).json({ error: 'No valid items in order' });

  const payload = { tableId, items: normalizedItems };

  if (useDb) {
    try {
      const db = require('../services/dbOrders');
      const created = await db.createOrderDB(payload);
      // fetch back the created order and normalize/enrich like GET /:id
      const rawOrder = await db.getOrderByIdDB(created.ma_order || created.id || created);
      if (!rawOrder) return res.status(201).json({});
      const menuData = await menuController.getMenuData();
      return res.status(201).json(normalizeDbOrder(rawOrder, menuData));
    } catch (err) {
      console.error('createOrderDB error', err);
      return res.status(500).json({ error: 'DB create error', detail: err.message });
    }
  }

  // In-memory fallback
  const newOrder = {
    id: orderId++,
    tableId: payload.tableId,
    items: payload.items.map(it => {
      const qty = (it.quantity !== undefined ? Number(it.quantity) : (it.soLuong !== undefined ? Number(it.soLuong) : (it.so_luong !== undefined ? Number(it.so_luong) : 1)));
      return { monId: it.monId, quantity: qty, soLuong: qty, status: 'Chưa chế biến' };
    }),
    trangThai: 'Đang xử lý',
    createdAt: new Date().toISOString(),
  };
  // enrich items with menu data (tenMon, gia) if available
  try{
    const menuData = await menuController.getMenuData();
    newOrder.items = (newOrder.items || []).map(it => {
      const id = it.monId || it.id || it.mon;
      const m = (menuData || []).find(mm => String(mm.id) === String(id));
      return Object.assign({}, it, { tenMon: m ? m.tenMon : (it.tenMon || null), gia: m ? m.gia : (it.gia || null), status: it.status || 'Chưa chế biến' });
    });
  }catch(e){ /* ignore */ }
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET orders by table (used by frontend tables page)
// Accepts query: tableId or ma_ban
router.get('/by-table', async (req, res) => {
  const tableId = req.query.tableId || req.query.ma_ban || req.query.maBan;
  if (!tableId) return res.status(400).json({ error: 'Thiếu tableId' });
  // If DB is enabled, try to load orders from DB service
  if (useDb) {
    try {
      const db = require('../services/dbOrders');
      const list = await db.getOrdersByTableDB(tableId);
      // normalize shape: attach menu names when available
      const menuData = await menuController.getMenuData();
      const enriched = (list || []).map(o => {
        const vals = o.dataValues || o;
        const items = vals.OrderItems || vals.order_items || vals.items || vals.CHITIET || [];
        const normItems = (items || []).map(it => {
          const v = it.dataValues || it;
          const id = v.ma_mon || v.monId || v.mon_id || v.id;
          const m = (menuData || []).find(mm => String(mm.id) === String(id));
          return Object.assign({}, v, { tenMon: m ? m.tenMon : (v.ten_mon || v.tenMon || `Món ${id}`) });
        });
        return Object.assign({}, vals, { items: normItems });
      });

      if (req.accepts && req.accepts('html')) {
        if (enriched.length === 0) return res.send('<p>Chưa có order cho bàn này.</p>');
        let html = '<ul>';
        enriched.forEach(o => {
          html += `<li>Order #${o.id || o.ma_order} - Trạng thái: ${o.trangThai || o.tinh_trang_order || ''}<ul>`;
          (o.items || []).forEach(it => {
            const name = it.tenMon || it.ten_mon || it.name || 'Món';
            const qty = it.soLuong || it.so_luong || it.quantity || 1;
            html += `<li>${name} x ${qty}</li>`;
          });
          html += '</ul></li>';
        });
        html += '</ul>';
        return res.send(html);
      }

      return res.json(enriched);
    } catch (err) {
      console.error('DB getOrdersByTableDB error', err);
      // fallthrough to in-memory below
    }
  }

  // fallback: use in-memory orders if DB not available or failed
  const tableOrders = orders.filter(o => String(o.tableId) === String(tableId));
  const menuData = await menuController.getMenuData();
  const enriched = tableOrders.map(o => ({
    ...o,
    items: (o.items || []).map(it => {
      const id = it.monId || it.id || it.mon;
      const m = menuData.find(mm => String(mm.id) === String(id));
      return Object.assign({}, it, { tenMon: m ? m.tenMon : (it.tenMon || `Món ${id}`) });
    })
  }));
  if (req.accepts && req.accepts('html')) {
    if (enriched.length === 0) {
      return res.send('<p>Chưa có order cho bàn này.</p>');
    }
    let html = '<ul>';
    enriched.forEach(o => {
      html += `<li>Order #${o.id} - Trạng thái: ${o.trangThai || ''}<ul>`;
      (o.items || []).forEach(it => {
        const name = it.tenMon || it.tenMon || it.monId || it.id || 'Món';
        const qty = it.soLuong || it.qty || it.count || 1;
        html += `<li>${name} x ${qty}</li>`;
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    return res.send(html);
  }
  res.json(enriched);
});

// Backwards-compatible alias for legacy frontend: /api/get_order_details?ma_ban=...
router.get('/get_order_details', async (req, res) => {
  // Reuse same logic: look for query param ma_ban or tableId
  const tableId = req.query.ma_ban || req.query.tableId || req.query.maBan;
  if (!tableId) return res.status(400).json({ error: 'Thiếu tableId' });
  // If DB enabled, try to fetch orders for the table from DB service
  if (useDb) {
    try {
      const db = require('../services/dbOrders');
      const list = await db.getOrdersByTableDB(tableId);
      const menuData = await menuController.getMenuData();
      const enriched = (list || []).map(o => {
        const vals = o.dataValues || o;
        const items = vals.OrderItems || vals.order_items || vals.items || vals.CHITIET || [];
        const normItems = (items || []).map(it => {
          const v = it.dataValues || it;
          const id = v.ma_mon || v.monId || v.mon_id || v.id;
          const m = (menuData || []).find(mm => String(mm.id) === String(id));
          return Object.assign({}, v, { tenMon: m ? m.tenMon : (v.ten_mon || v.tenMon || `Món ${id}`) });
        });
        return Object.assign({}, vals, { items: normItems });
      });
      if (req.accepts && req.accepts('html')) {
        if (enriched.length === 0) return res.send('<p>Chưa có order cho bàn này.</p>');
        let html = '<ul>';
        enriched.forEach(o => {
          html += `<li>Order #${o.id || o.ma_order} - Trạng thái: ${o.trangThai || o.tinh_trang_order || ''}<ul>`;
          (o.items || []).forEach(it => {
            const name = it.tenMon || it.ten_mon || it.name || 'Món';
            const qty = it.soLuong || it.so_luong || it.quantity || 1;
            html += `<li>${name} x ${qty}</li>`;
          });
          html += '</ul></li>';
        });
        html += '</ul>';
        return res.send(html);
      }
      return res.json(enriched);
    } catch (err) {
      console.error('DB get_order_details error', err);
      // fallthrough to in-memory below
    }
  }

  // fallback: old in-memory behaviour
  const tableOrders = orders.filter(o => String(o.tableId) === String(tableId));
  const menuData = await menuController.getMenuData();
  const enriched = tableOrders.map(o => ({
    ...o,
    items: (o.items || []).map(it => {
      const id = it.monId || it.id || it.mon;
      const m = menuData.find(mm => String(mm.id) === String(id));
      return Object.assign({}, it, { tenMon: m ? m.tenMon : (it.tenMon || `Món ${id}`) });
    })
  }));
  if (req.accepts && req.accepts('html')) {
    if (enriched.length === 0) return res.send('<p>Chưa có order cho bàn này.</p>');
    let html = '<ul>';
    enriched.forEach(o => {
      html += `<li>Order #${o.id} - Trạng thái: ${o.trangThai || ''}<ul>`;
      (o.items || []).forEach(it => {
        const name = it.tenMon || it.tenMon || it.monId || it.id || 'Món';
        const qty = it.soLuong || it.qty || it.count || 1;
        html += `<li>${name} x ${qty}</li>`;
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    return res.send(html);
  }
  res.json(enriched);
});

// GET order detail
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (useDb) {
    try {
      const db = require('../services/dbOrders');
      const raw = await db.getOrderByIdDB(id);
      if (!raw) return res.status(404).json({ message: 'Không tìm thấy order' });
      const menuData = await menuController.getMenuData();
      return res.json(normalizeDbOrder(raw, menuData));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
  }
  const order = orders.find((o) => o.id == id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy order' });
  // normalize/enrich in-memory order before returning
  try{
    const menuData = await menuController.getMenuData();
    const items = (order.items || []).map(it => {
      const id = it.monId || it.id || it.mon;
      const m = menuData.find(mm => String(mm.id) === String(id));
      return Object.assign({}, it, { tenMon: m ? m.tenMon : (it.tenMon || `Món ${id}`), gia: m ? m.gia : (it.gia || null) });
    });
    const normalized = {
      id: order.id,
      tableId: order.tableId,
      createdAt: order.createdAt,
      trangThai: order.trangThai,
      items
    };
    return res.json(normalized);
  }catch(e){ return res.json(order); }
});

// PUT update order
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find((o) => Number(o.id) === id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy order" });
  Object.assign(order, req.body);
  res.json(order);
});

// Update an item's status within an order (by item index)
router.put('/:id/items/:index', (req, res) => {
  const id = req.params.id;
  const idx = parseInt(req.params.index, 10);
  // If DB is enabled, update the OrderItem row in DB
  if (useDb) {
    (async () => {
      try {
        const db = require('../services/dbOrders');
        const raw = await db.getOrderByIdDB(id);
        if (!raw) return res.status(404).json({ message: 'Không tìm thấy order' });
        const vals = raw.dataValues || raw;
        const itemsRaw = vals.OrderItems || vals.order_items || vals.CHI_TIET_ORDERs || [];
        if (!itemsRaw || !itemsRaw[idx]) return res.status(404).json({ message: 'Không tìm thấy item' });
        const itemInstance = itemsRaw[idx];
        const v = itemInstance.dataValues || itemInstance;
        const newStatus = req.body.status;
        // VN uses tinh_trang or tinh_trang_mon, EN uses status
        if (v.tinh_trang !== undefined || v.tinh_trang_mon !== undefined) {
          itemInstance.tinh_trang = newStatus;
        } else if (v.status !== undefined) {
          itemInstance.status = newStatus;
        } else {
          // best-effort: set status field
          itemInstance.status = newStatus;
        }
        // try save (Sequelize instance) or return success for plain object
        if (typeof itemInstance.save === 'function') {
          await itemInstance.save();
        }
        return res.json({ message: 'Đã cập nhật', item: itemInstance.dataValues || itemInstance });
      } catch (err) {
        console.error('DB update item status error', err);
        return res.status(500).json({ error: 'DB update error' });
      }
    })();
    return;
  }

  const order = orders.find(o => String(o.id) === String(id));
  if(!order) return res.status(404).json({ message: 'Không tìm thấy order' });
  if(!order.items || !order.items[idx]) return res.status(404).json({ message: 'Không tìm thấy item' });
  const newStatus = req.body.status;
  order.items[idx].status = newStatus;
  res.json({ message: 'Đã cập nhật', item: order.items[idx] });
});

// New: Update an item's status by item-PK (robust for DB-backed orders)
router.put('/items/:itemKey', async (req, res) => {
  const itemKey = req.params.itemKey;
  const newStatus = req.body.status;
  // If DB is enabled, update the OrderItem row in DB using PK or composite key
  if (useDb) {
    try {
      const db = require('../services/dbOrders');
      await db.resolveModelsIfNeeded();
      const useVn = db.getUseVnSchema();
      if (!useVn) {
        // English schema: OrderItem has numeric id
        const OrderItem = require('../db_models/OrderItemModel');
        const it = await OrderItem.findByPk(itemKey);
        if (!it) return res.status(404).json({ message: 'Không tìm thấy item' });
        if (it.tinh_trang !== undefined) it.tinh_trang = newStatus;
        if (it.status !== undefined) it.status = newStatus;
        if (typeof it.save === 'function') await it.save();
        return res.json({ message: 'Đã cập nhật', item: it.dataValues || it });
      }

      // VN schema: itemKey expected in format ma_order_ma_mon or ma_order:ma_mon
      let ma_order, ma_mon;
      if (itemKey.includes('_')) [ma_order, ma_mon] = itemKey.split('_');
      else if (itemKey.includes(':')) [ma_order, ma_mon] = itemKey.split(':');
      else return res.status(400).json({ error: 'Invalid item key for VN schema' });
      const OrderItemVn = require('../db_models/vn/OrderItemVnModel');
      const found = await OrderItemVn.findOne({ where: { ma_order: ma_order, ma_mon: ma_mon } });
      if (!found) return res.status(404).json({ message: 'Không tìm thấy item' });
      found.tinh_trang = newStatus;
      if (typeof found.save === 'function') await found.save();
      return res.json({ message: 'Đã cập nhật', item: found.dataValues || found });
    } catch (err) {
      console.error('DB update item status by PK error', err);
      return res.status(500).json({ error: 'DB update error' });
    }
  }

  // In-memory fallback: require orderId in body and treat numeric itemKey as index or monId
  const orderId = req.body.orderId;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId for in-memory update' });
  const order = orders.find(o => String(o.id) === String(orderId));
  if (!order) return res.status(404).json({ message: 'Không tìm thấy order' });
  // try treat itemKey as index
  const idx = parseInt(itemKey, 10);
  if (!Number.isNaN(idx) && order.items && order.items[idx]) {
    order.items[idx].status = newStatus;
    return res.json({ message: 'Đã cập nhật', item: order.items[idx] });
  }
  // otherwise try match by monId
  const found = (order.items || []).find(it => String(it.monId || it.id) === String(itemKey));
  if (found) { found.status = newStatus; return res.json({ message: 'Đã cập nhật', item: found }); }
  return res.status(404).json({ message: 'Không tìm thấy item' });
});

// DELETE order
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (useDb) {
    try {
      const dbOrders = require('../services/dbOrders');
      const deleted = await dbOrders.deleteOrderById(id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy order' });
      return res.json({ message: 'Đã xóa order' });
    } catch (err) {
      console.error('DB delete error', err);
      return res.status(500).json({ error: 'DB delete error' });
    }
  }
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy order' });
  const removed = orders.splice(idx, 1)[0];
  res.json({ message: 'Đã xóa order', deleted: removed });
});

module.exports = router;
