const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
console.log('Current environment:', env);  // Log the current environment

const config = require('../config/config')[env];
console.log('Database configuration loaded:', config);  // Log the loaded database configuration

// Check if all required config properties are present
if (!config.database || !config.username || !config.password || !config.host || !config.dialect) {
    console.error('Database configuration is incomplete');
}

// Initialize Sequelize with the database configuration
const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  {
    host: config.host,
    dialect: config.dialect,
    define: {
      timestamps: config.define ? config.define.timestamps : false
    },
    logging: console.log  // Logs all SQL queries to the console
  }
);

// Function to log database connection status
function logDatabaseConnectionStatus() {
  sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));
}

// Log the database connection status
logDatabaseConnectionStatus();

// Import models
const User = require('./User')(sequelize, Sequelize);
const Post = require('./Post')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);

console.log('Models imported successfully');  // Log successful model importation

// Define model relationships
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

console.log('Model relationships defined successfully');  // Log successful relationship definition

// Export the sequelize instance and all models
module.exports = {
  sequelize,
  User,
  Post,
  Comment
};
