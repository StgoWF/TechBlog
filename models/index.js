const Sequelize = require('sequelize');
const config = require('../config/config').development;

// Initialize Sequelize with the database configuration
const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  {
    host: config.host,
    dialect: config.dialect,
    define: {
      timestamps: true  // Enable timestamps for all tables
      
    },
    logging: console.log
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize);
const Post = require('./Post')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);

// Define model relationships
User.hasMany(Post, { foreignKey: 'userId' }); // A user can have many posts
Post.belongsTo(User, { foreignKey: 'userId' }); // A post belongs to a user

Post.hasMany(Comment, { foreignKey: 'postId' }); // A post can have many comments
Comment.belongsTo(Post, { foreignKey: 'postId' }); // A comment belongs to a post

// Export the sequelize instance and all models
module.exports = {
  sequelize,
  User,
  Post,
  Comment
};
