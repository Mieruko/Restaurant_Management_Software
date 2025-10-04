const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const OrderVn = require('./OrderVnModel');

const OrderItemVn = sequelize.define('CHI_TIET_ORDER', {
  ma_order: { type: DataTypes.INTEGER, primaryKey: true, field: 'ma_order' },
  ma_mon: { type: DataTypes.INTEGER, primaryKey: true, field: 'ma_mon' },
  so_luong: { type: DataTypes.INTEGER, field: 'so_luong' },
  gia_tai_thoi_diem: { type: DataTypes.DECIMAL(12,2), field: 'gia_tai_thoi_diem' },
  tinh_trang: { type: DataTypes.STRING, field: 'tinh_trang' }
}, { tableName: 'CHI_TIET_ORDER', timestamps: false });

OrderVn.hasMany(OrderItemVn, { foreignKey: 'ma_order' });
OrderItemVn.belongsTo(OrderVn, { foreignKey: 'ma_order' });

module.exports = OrderItemVn;
