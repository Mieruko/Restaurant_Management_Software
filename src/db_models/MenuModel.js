const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Menu = sequelize.define('Menu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenMon: { type: DataTypes.STRING, allowNull: false },
  gia: { type: DataTypes.INTEGER, allowNull: false },
  loai: { type: DataTypes.STRING }
}, { tableName: 'menus', timestamps: false });

module.exports = Menu;
