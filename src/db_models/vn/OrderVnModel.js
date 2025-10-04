const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const OrderVn = sequelize.define('ORDERS', {
  ma_order: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ma_order' },
  ngay_gio_tao: { type: DataTypes.DATE, field: 'ngay_gio_tao' },
  tinh_trang_order: { type: DataTypes.STRING, field: 'tinh_trang_order' },
  ma_ban: { type: DataTypes.INTEGER, field: 'ma_ban' },
  ma_nv: { type: DataTypes.INTEGER, field: 'ma_nv' },
  ma_kh: { type: DataTypes.INTEGER, field: 'ma_kh' }
}, { tableName: 'ORDERS', timestamps: false });

module.exports = OrderVn;
