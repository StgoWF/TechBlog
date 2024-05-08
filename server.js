require('dotenv').config();
console.log("Environment:", process.env.NODE_ENV || 'development');

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { exec } = require('child_process');


// Import the sequelize instance and models from your models' index file
const { sequelize } = require('./models/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para manejar datos JSON y datos codificados por URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
const sess = {
  secret: 'TechBlog secret', // Usa una frase secreta real en producción
  cookie: {},
  store: new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // Intervalo para limpiar sesiones expiradas
    expiration: 24 * 60 * 60 * 1000 // Tiempo de expiración de la sesión (por ejemplo, 24 horas)
  }),
  resave: false,
  saveUninitialized: true,
};
app.use(session(sess));

// Importar rutas
const homeRoutes = require('./controllers/homeRoutes');

// Middlewares para servir archivos estáticos, adecuar según tu estructura de carpetas
app.use(express.static(path.join(__dirname, 'public')));

// Usar las rutas definidas
app.use(homeRoutes);

// Página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor y sincronizar modelos con la base de datos
sequelize.sync().then(() => {
    console.log('Database tables synchronized!');

    // Inicia el servidor
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to synchronize tables:', error);
});


function runMigration() {
  exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during migration: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Migration stderr: ${stderr}`);
      return;
    }
    console.log(`Migration stdout: ${stdout}`);
  });
}
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
        runMigration();
    });

