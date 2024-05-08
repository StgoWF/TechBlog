require('dotenv').config();
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}
console.log("Environment:", process.env.NODE_ENV);

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sequelize = require('sequelize');
const sequelize  = require('./models/index');

const config = require('./config/config'); // Asegúrate de que la ruta del archivo de configuración es correcta

const app = express();
const PORT = process.env.PORT || 3000;

// Inicialización de Sequelize basada en el entorno
if (process.env.NODE_ENV === 'production' && process.env.JAWSDB_URL) {
    sequelize = new Sequelize(process.env.JAWSDB_URL, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    const localConfig = config.development;
    sequelize = new Sequelize(
        localConfig.database,
        localConfig.username,
        localConfig.password,
        {
            host: localConfig.host,
            dialect: localConfig.dialect
        }
    );
}

// Sincroniza todas las tablas y luego configura el servidor
sequelize.sync({ force: true }).then(() => {
    console.log('Database tables dropped and recreated!');

    // Configuración del motor de plantillas Handlebars
    app.engine('handlebars', engine({ defaultLayout: 'main' }));
    app.set('view engine', 'handlebars');

    // Middleware para manejar datos JSON y codificados por URL
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configuración de la sesión con SequelizeStore
    const sess = {
        secret: 'TechBlog secret',
        cookie: {},
        store: new SequelizeStore({ db: sequelize }),
        resave: false,
        saveUninitialized: true
    };
    app.use(session(sess));
    console.log('Session middleware configured.');

    // Middleware para servir archivos estáticos
    app.use(express.static(path.join(__dirname, 'public')));

    // Importa y usa rutas definidas
    const homeRoutes = require('./controllers/homeRoutes');
    app.use(homeRoutes);

    // Ruta para la página principal
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Inicia el servidor
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });

}).catch((error) => {
    console.error('Failed to recreate tables:', error);
});
