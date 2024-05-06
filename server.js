const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const exphbs = require('express-handlebars');
const { sequelize } = require('./models'); // Ensure you're destructuring to get the sequelize instance
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Handlebars as the view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration using Sequelize to store session data
const sess = {
  secret: 'TechBlog secret', // Replace 'TechBlog secret' with your actual secret in production
  cookie: {}, // Additional options for the session cookie can be set here
  store: new SequelizeStore({
    db: sequelize, // Pass the Sequelize instance to the session store
  }),
  resave: false,
  saveUninitialized: true,
};
app.use(session(sess));

// Middleware to serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const homeRoutes = require('./controllers/homeRoutes');
app.use(homeRoutes); // Use the defined routes

// Home page route
app.get('/', (req, res) => {
    res.render('home'); // Use the 'home' Handlebars template for the root route
});

// Start the server and sync database
app.listen(PORT, async () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    try {
        await sequelize.sync({ force: false }); // Set to 'true' to recreate tables on startup, use 'false' in production
        console.log('Database tables synced!');
    } catch (error) {
        console.error('Failed to sync database:', error);
    }
});
