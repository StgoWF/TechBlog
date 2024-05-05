// config/config.js
require('dotenv').config();  // Ensures we can use environment variables

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  production: {
    use_env_variable: 'JAWSDB_URL',
    dialect: 'mysql'
  }
};
