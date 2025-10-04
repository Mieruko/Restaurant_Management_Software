const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const StaffVn = sequelize.define('NHAN_VIEN', {
  ma_nv: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ma_nv' },
  ten_nv: { type: DataTypes.STRING, field: 'ten_nv' },
  ngay_sinh: { type: DataTypes.DATE, field: 'ngay_sinh' },
  gioi_tinh: { type: DataTypes.STRING, field: 'gioi_tinh' },
  chuc_vu: { type: DataTypes.STRING, field: 'chuc_vu' },
  sdt: { type: DataTypes.STRING, field: 'sdt' },
  dia_chi: { type: DataTypes.STRING, field: 'dia_chi' },
  ngay_vao_lam: { type: DataTypes.DATE, field: 'ngay_vao_lam' },
  trang_thai: { type: DataTypes.STRING, field: 'trang_thai' },
  username: { type: DataTypes.STRING, field: 'username' },
  password_hash: { type: DataTypes.STRING, field: 'password_hash' }
}, { tableName: 'NHAN_VIEN', timestamps: false });

module.exports = StaffVn;
