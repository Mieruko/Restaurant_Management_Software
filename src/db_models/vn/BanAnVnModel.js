const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const BanAnVn = sequelize.define('BAN_AN', {
  ma_ban: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ma_ban' },
  ten_ban: { type: DataTypes.STRING, field: 'ten_ban' },
  so_nguoi: { type: DataTypes.INTEGER, field: 'so_nguoi' },
  tinh_trang: { type: DataTypes.STRING, field: 'tinh_trang' },
  vi_tri: { type: DataTypes.STRING, field: 'vi_tri' },
  ma_kh: { type: DataTypes.INTEGER, field: 'ma_kh' }
}, { tableName: 'BAN_AN', timestamps: false });

module.exports = BanAnVn;
