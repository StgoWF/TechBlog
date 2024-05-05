// server.js
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./models/index');  // Make sure to import sequelize

const sess = {
  secret: 'Super secret secret',  // Change this to a real secret in production
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// Use session middleware
app.use(session(sess));
