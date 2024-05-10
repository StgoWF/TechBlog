// config/config.js
require('dotenv').config(); 
console.log('Starting server...'); // Log message indicating server startup


console.log("Environment:", process.env.NODE_ENV); // Log message displaying current environment
module.exports = {
  development: {
    username: process.env.DB_USER, // Database username for development environment
    password: process.env.DB_PASSWORD, // Database password for development environment
    database: process.env.DB_NAME, // Database name for development environment
    host: process.env.DB_HOST, // Database host for development environment
    dialect: 'mysql', // Database dialect used for development (MySQL)
    define: {
      timestamps: true  // Ensure all created tables include default timestamp fields
    }
  },
  production: {
    use_env_variable: 'JAWSDB_URL', // Use environment variable for production database URL
    dialect: 'mysql', // Database dialect used for production (MySQL)
    migrationStorageTableName: "sequelize_migrations", // Name of the table used for Sequelize migrations
    define: {
      timestamps: true  // Apply the same for the production environment
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false  // Necessary for secure database connections
      }
    },
    logging: false  // Disable SQL query logging to clean up console output
  }
};
