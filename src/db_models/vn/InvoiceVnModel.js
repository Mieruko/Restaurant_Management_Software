const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const InvoiceVn = sequelize.define('HOA_DON', {
  ma_hoa_don: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ma_hoa_don' },
  ngay_lap: { type: DataTypes.DATE, field: 'ngay_lap' },
  tong_tien: { type: DataTypes.DECIMAL(15,2), field: 'tong_tien' },
  tinh_trang_thanh_toan: { type: DataTypes.STRING, field: 'tinh_trang_thanh_toan' },
  phuong_thuc: { type: DataTypes.STRING, field: 'phuong_thuc' },
  ma_order: { type: DataTypes.INTEGER, unique: true, field: 'ma_order' },
  ma_ban: { type: DataTypes.INTEGER, field: 'ma_ban' },
  ma_kh: { type: DataTypes.INTEGER, field: 'ma_kh' }
}, { tableName: 'HOA_DON', timestamps: false });

module.exports = InvoiceVn;
