const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'quanlynhahang',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('\u2705 MySQL connection established.');
  } catch (err) {
    console.error('\u274c Unable to connect to MySQL:', err.message);
  }
}

testConnection();

module.exports = sequelize;
