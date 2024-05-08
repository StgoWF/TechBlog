const Sequelize = require('sequelize');
const config = require('../config/config');

// Determine the environment and load the appropriate database configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
let sequelize;
if (dbConfig.use_env_variable) {
    // Use environment variable for the database URL in production
    sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false // Change to true to enable SQL logging in development
    });
} else {
    // Use local configuration for development
    sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password, 
        {
            host: dbConfig.host,
            dialect: dbConfig.dialect,
            define: {
                timestamps: dbConfig.define ? dbConfig.define.timestamps : true
            },
            logging: console.log // Log SQL queries to console
        }
    );
}

// Log the database connection status
sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));

// const Session = sequelize.define('Session', {}, {
//     tableName: 'Sessions',
//     timestamps: true // Enable automatic handling of createdAt and updatedAt
// });

// Import and initialize other models
const User = require('./User')(sequelize, Sequelize);
const Post = require('./Post')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);

// Define model relationships
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Export the Sequelize instance and all models
module.exports = {
  sequelize,
  Session,
  User,
  Post,
  Comment
};
