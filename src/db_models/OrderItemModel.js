const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./OrderModel');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  monId: { type: DataTypes.INTEGER },
  tenMon: { type: DataTypes.STRING },
  soLuong: { type: DataTypes.INTEGER, defaultValue: 1 },
  gia: { type: DataTypes.INTEGER }
}, { tableName: 'order_items', timestamps: false });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = OrderItem;
