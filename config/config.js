// config/config.js
require('dotenv').config();  // Asegura que se puedan usar variables de entorno

module.exports = {
  production: {
    use_env_variable: 'JAWSDB_URL',
    dialect: 'mysql',
    "migrationStorageTableName": "migrations",
    define: {
      timestamps: false  // Aplique lo mismo para el entorno de producción
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false  // Necesario para conexiones de base de datos seguras
      }
    },
    logging: false  // Desactiva el registro de consultas SQL para limpiar la salida de la consola
  }
};
