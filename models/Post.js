// models/Post.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

class Post extends Model {}

Post.init({
  // Define attributes
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Post'
});

module.exports = Post;
