const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tableId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  items: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tinhtrangThanhtoan: {
    type: DataTypes.STRING,
    defaultValue: 'Chuẩn bị hoá đơn',
  },
  ngayTao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'invoices',
  timestamps: false,
});

module.exports = Invoice;
