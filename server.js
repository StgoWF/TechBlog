const path = require('path');
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sequelize = require('sequelize');
const config = require('./config/config'); // Asegúrate de que la ruta sea correcta
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Crea una instancia de Sequelize basada en el entorno
const env = process.env.NODE_ENV || 'development';
const sequelizeConfig = config[env];
let sequelize;
if (sequelizeConfig.use_env_variable) {
    sequelize = new Sequelize(process.env[sequelizeConfig.use_env_variable], sequelizeConfig);
} else {
    sequelize = new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, sequelizeConfig);
}

app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Middleware para manejar datos JSON y codificados por URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la sesión
const sess = {
  secret: 'TechBlog secret',
  cookie: {},
  store: new SequelizeStore({
    db: sequelize,
  }),
  resave: false,
  saveUninitialized: true,
};
app.use(session(sess));

// Importa rutas
const homeRoutes = require('./controllers/homeRoutes');

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usa rutas definidas
app.use(homeRoutes);

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia el servidor
app.listen(PORT, async () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    try {
        await sequelize.sync({ force: false }); // Sincroniza los modelos con la DB, crea tablas si no existen
        console.log('Database tables created or updated!');
    } catch (error) {
        console.error('Failed to sync database:', error);
    }
});
