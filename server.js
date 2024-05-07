const path = require('path');
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sequelize = require('sequelize');
const config = require('./config/config'); // Make sure the path is correct
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Create Sequelize instance based on the environment
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

// Middleware to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
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

// Import routes
const homeRoutes = require('./controllers/homeRoutes');

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Use defined routes
app.use(homeRoutes);

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, async () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    try {
        await sequelize.sync({ force: true }); // Sync models with DB, create tables if they don't exist
        console.log('Database tables created!');
    } catch (error) {
        console.error('Failed to sync database:', error);
    }
});
