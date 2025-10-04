const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CustomerVn = sequelize.define('KHACH_HANG', {
  ma_kh: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ma_kh' },
  ten_kh: { type: DataTypes.STRING, field: 'ten_kh' },
  sdt: { type: DataTypes.STRING, field: 'sdt' },
  gioi_tinh: { type: DataTypes.STRING, field: 'gioi_tinh' },
  loai_khach: { type: DataTypes.STRING, field: 'loai_khach' }
}, { tableName: 'khach_hang', timestamps: false });

module.exports = CustomerVn;
