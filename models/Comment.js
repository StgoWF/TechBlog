// models/Comment.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

class Comment extends Model {}

Comment.init({
  // Define attributes
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Comment'
});

module.exports = Comment;
