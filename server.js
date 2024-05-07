// Server.js
console.log('Starting server...');
console.log("Environment:", process.env.NODE_ENV);

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sequelize = require('sequelize');
const config = require('./config/config'); // Ensure the path to config is correct

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sequelize based on the environment
let sequelize;
if (process.env.NODE_ENV === 'production' && process.env.JAWSDB_URL) {
    console.log("Using JAWSDB_URL for production database connection.");
    sequelize = new Sequelize(process.env.JAWSDB_URL, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false  // Necessary for secure database connections
            }
        },
        logging: true // Enable logging for debugging SQL queries
    });
} else {
    console.log("Using local database configuration.");
    sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
        host: config.development.host,
        dialect: config.development.dialect,
        logging: true // Enable logging for debugging SQL queries
    });
}

// Test the connection
sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));

app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Middleware for handling JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sess = {
    secret: process.env.SESSION_SECRET|| 'TechBlog secret', // Ensure this is set in your .env file or environment variables
    cookie: {},
    store: new SequelizeStore({
        db: sequelize,
        checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions
        expiration: 24 * 60 * 60 * 1000 // The expiration time for sessions
    }),
    resave: false,
    saveUninitialized: true
};

// Error handling for SequelizeStore setup
sess.store.sync().catch(err => {
    console.error('Error setting up session store:', err);
});
app.use(session(sess));
console.log('Session middleware configured.');

// Import routes
const homeRoutes = require('./controllers/homeRoutes');

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Use defined routes
app.use(homeRoutes);

// Route for the home page
app.get('/', (req, res) => {
    console.log('Handling GET request for the home page');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, async () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    try {
        await sequelize.sync({ force: false }); // Sync models with DB, create tables if they don't exist
        console.log('Database tables created or updated!');
    } catch (error) {
        console.error('Failed to sync database:', error);
    }
});
