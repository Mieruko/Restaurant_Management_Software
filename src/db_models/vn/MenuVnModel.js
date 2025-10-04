const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const MenuVn = sequelize.define('MON_AN', {
  ma_mon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ma_mon' },
  ten_mon: { type: DataTypes.STRING, field: 'ten_mon' },
  loai_mon: { type: DataTypes.STRING, field: 'loai_mon' },
  gia: { type: DataTypes.DECIMAL(12,2), field: 'gia' },
  tinh_trang: { type: DataTypes.STRING, field: 'tinh_trang' }
}, { tableName: 'MON_AN', timestamps: false });

module.exports = MenuVn;
