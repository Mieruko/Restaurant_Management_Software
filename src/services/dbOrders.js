const sequelize = require('../config/db');
let Order = null;
let OrderItem = null;
let Menu = null;

// Load both model files if available, we'll pick the correct one based on actual DB tables
let Eng_Order = null, Eng_OrderItem = null, Eng_Menu = null;
let Vn_Order = null, Vn_OrderItem = null, Vn_Menu = null;
try { Eng_Order = require('../db_models/OrderModel'); } catch (e) { Eng_Order = null; }
try { Eng_OrderItem = require('../db_models/OrderItemModel'); } catch (e) { Eng_OrderItem = null; }
try { Eng_Menu = require('../db_models/MenuModel'); } catch (e) { Eng_Menu = null; }
try { Vn_Order = require('../db_models/vn/OrderVnModel'); } catch (e) { Vn_Order = null; }
try { Vn_OrderItem = require('../db_models/vn/OrderItemVnModel'); } catch (e) { Vn_OrderItem = null; }
try { Vn_Menu = require('../db_models/vn/MenuVnModel'); } catch (e) { Vn_Menu = null; }

// Lazy resolver: determine which model set to use by checking actual tables in the database
let useVnSchema = null;
async function resolveModelsIfNeeded(){
  if (Order && OrderItem && Menu && useVnSchema !== null) return;
  try{
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    const names = tables.map(t => String(t).toUpperCase());
    const hasVnMenu = names.includes('MON_AN');
    const hasVnOrderItems = names.includes('CHI_TIET_ORDER');
    const hasVnTables = names.includes('BAN_AN');
    const hasVnOrders = names.includes('ORDERS');
    const hasVn = hasVnMenu || hasVnOrderItems || hasVnTables || hasVnOrders;
    if (hasVn) {
      Order = Vn_Order || Eng_Order;
      OrderItem = Vn_OrderItem || Eng_OrderItem;
      Menu = Vn_Menu || Eng_Menu;
      useVnSchema = true;
      return;
    }
    const hasEngMenu = names.includes('MENUS') || names.includes('MENU');
    const hasEngOrders = names.includes('ORDERS') || names.includes('INVOICES');
    const hasEng = hasEngMenu || hasEngOrders;
    if (hasEng) {
      Order = Eng_Order || Vn_Order;
      OrderItem = Eng_OrderItem || Vn_OrderItem;
      Menu = Eng_Menu || Vn_Menu;
      useVnSchema = false;
      return;
    }
    // fallback
    Order = Eng_Order || Vn_Order;
    OrderItem = Eng_OrderItem || Vn_OrderItem;
    Menu = Eng_Menu || Vn_Menu;
    useVnSchema = !!Vn_Order || !!Vn_Menu || !!Vn_OrderItem;
  }catch(e){
    Order = Eng_Order || Vn_Order;
    OrderItem = Eng_OrderItem || Vn_OrderItem;
    Menu = Eng_Menu || Vn_Menu;
    useVnSchema = !!Vn_Order || !!Vn_Menu || !!Vn_OrderItem;
  }
}

async function createOrderDB({ tableId, items }){
  await resolveModelsIfNeeded();
  if (!Order || !OrderItem || !Menu) throw new Error('DB models not available');
  const t = await sequelize.transaction();
  try{
    // If VN schema detected, use VN field names
    if (useVnSchema) {
      // VN schema: set ma_ban when provided
      const orderPayload = {};
      if (tableId !== undefined && tableId !== null) orderPayload.ma_ban = tableId;
      const order = await Order.create(orderPayload, { transaction: t });
      for(const it of items){
        const menuItem = await Menu.findByPk(it.monId);
        await OrderItem.create({ ma_order: order.ma_order, ma_mon: it.monId, so_luong: it.soLuong || it.so_luong || 1, gia_tai_thoi_diem: menuItem?menuItem.gia:null }, { transaction: t });
      }
      await t.commit();
      return order;
    }
    // otherwise assume English schema
    const order = await Order.create({ tableId }, { transaction: t });
    for(const it of items){
      const menuItem = await Menu.findByPk(it.monId);
      await OrderItem.create({ orderId: order.id, monId: it.monId, tenMon: menuItem?menuItem.tenMon:null, soLuong: it.soLuong || it.so_luong || 1, gia: menuItem?menuItem.gia:null }, { transaction: t });
    }
    await t.commit();
    return order;
  }catch(err){ await t.rollback(); throw err; }
}

async function listOrdersDB(){
  await resolveModelsIfNeeded();
  if (!Order || !OrderItem) return [];
  return Order.findAll({ include: [{ model: OrderItem }] });
}

async function getOrdersByTableDB(tableId){
  await resolveModelsIfNeeded();
  if (!Order || !OrderItem) return [];
  if (useVnSchema) {
    return Order.findAll({ where: { ma_ban: tableId }, include: [{ model: OrderItem }] });
  }
  return Order.findAll({ where: { tableId }, include: [{ model: OrderItem }] });
}

module.exports = { createOrderDB, listOrdersDB, getOrdersByTableDB };

async function getOrderByIdDB(id){
  await resolveModelsIfNeeded();
  if (!Order) return null;
  if (useVnSchema) {
    const o = await Order.findOne({ where: { ma_order: id }, include: [{ model: OrderItem }] });
    return o || null;
  }
  const o = await Order.findByPk(id, { include: [{ model: OrderItem }] });
  return o || null;
}

// Export resolver helper and a getter for the detected schema so routes can act accordingly
function getUseVnSchema() { return useVnSchema; }

module.exports = { createOrderDB, listOrdersDB, getOrdersByTableDB, getOrderByIdDB, resolveModelsIfNeeded, getUseVnSchema };

// Delete order and its items by id using the detected schema
async function deleteOrderById(id){
  await resolveModelsIfNeeded();
  if (!Order) throw new Error('Order model not available');
  if (useVnSchema) {
    // VN schema uses ma_order and CHI_TIET_ORDER
    try {
      await OrderItem.destroy({ where: { ma_order: id } });
    } catch(e){ /* ignore if missing */ }
    const deleted = await Order.destroy({ where: { ma_order: id } });
    return !!deleted;
  }
  // English schema
  try {
    await OrderItem.destroy({ where: { orderId: id } });
  } catch(e){ /* ignore if missing */ }
  const deleted = await Order.destroy({ where: { id } });
  return !!deleted;
}

module.exports.deleteOrderById = deleteOrderById;
