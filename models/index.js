// models/index.js
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');

User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);

module.exports = { User, Post, Comment };
