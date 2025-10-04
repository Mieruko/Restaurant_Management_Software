const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tableId: { type: DataTypes.INTEGER },
  trangThai: { type: DataTypes.STRING, defaultValue: 'Đang xử lý' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'orders', timestamps: false });

module.exports = Order;
