// server.js
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); // Make sure to destructure to get the sequelize instance
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
