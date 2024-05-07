// Server.js
// Server.js
console.log('Starting server...');
console.log("Environment:", process.env.NODE_ENV);

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sequelize = require('sequelize');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000;

console.log("JAWSDB_URL:", process.env.JAWSDB_URL);

let sequelize;
if (process.env.NODE_ENV === 'production' && process.env.JAWSDB_URL) {
    console.log("Using JAWSDB_URL for production database connection.");
    sequelize = new Sequelize(process.env.JAWSDB_URL, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: console.log
    });
} else {
    console.log("Using local database configuration:", config.development);
    sequelize = new Sequelize(
        config.development.database,
        config.development.username,
        config.development.password, {
            host: config.development.host,
            dialect: 'mysql',
            logging: console.log
        }
    );
}

sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));

app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const homeRoutes = require('./controllers/homeRoutes');
app.use(express.static(path.join(__dirname, 'public')));
app.use(homeRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    try {
        await sequelize.sync({ force: false });
        console.log('Database tables created or updated!');
    } catch (error) {
        console.error('Failed to sync database:', error);
    }
});
