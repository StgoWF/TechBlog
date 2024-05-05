// server.js
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); // Ensure you're destructuring to get the sequelize instance
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000, use environment variable to override

// Middlewares to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sess = {
  secret: 'TechBlog secret', // Use a real secret phrase in production
  cookie: {},
  store: new SequelizeStore({
    db: sequelize, // Make sure to pass the sequelize instance directly
  }),
  resave: false,
  saveUninitialized: true,
};
app.use(session(sess));

// Import routes
const homeRoutes = require('./controllers/homeRoutes');

// Middleware to serve static files, adjust according to your folder structure
app.use(express.static(path.join(__dirname, 'public')));

// Use defined routes
app.use(homeRoutes);

// Home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});
