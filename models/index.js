// models/index.js
const Sequelize = require('sequelize');
const config = require('../config/config').development;

const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  {
    host: config.host,
    dialect: config.dialect,
    define: {
      timestamps: false
    }
  }
);

const User = require('./User')(sequelize, Sequelize); // Ensure you're passing both sequelize instance and Sequelize class
const Post = require('./Post')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);

// Optional: Define relationships here if needed

module.exports = {
  sequelize,
  User,
  Post,
  Comment
};
