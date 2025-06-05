require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Set to true to see SQL queries in console
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ MySQL Connected via Sequelize'))
  .catch((err) => {
    console.error('❌ MySQL Connection Error:', err.message);
    process.exit(1);
  });

module.exports = { sequelize };
