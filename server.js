console.log("Environment:", process.env.NODE_ENV);

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sequelize = require('sequelize');
const config = require('./config/config'); // Asegúrate de que la ruta del archivo de configuración es correcta

const app = express();
const PORT = process.env.PORT || 3000;

let sequelize;
if (process.env.NODE_ENV === 'production') {
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
    sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
        host: config.development.host,
        dialect: config.development.dialect
    });
}


// Prueba la conexión
sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));

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
console.log('Session middleware configured.');

// Importa rutas
const homeRoutes = require('./controllers/homeRoutes');

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Utiliza rutas definidas
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
