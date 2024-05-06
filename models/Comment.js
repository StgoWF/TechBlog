// models/Comment.js
module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  class Comment extends Sequelize.Model {}

  Comment.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
          notEmpty: true, // This ensures that the comment cannot be an empty string.
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to table name
        key: 'id' // Refers to column name in Users table
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts', // Refers to table name
        key: 'id' // Refers to column name in Posts table
      }
    }
  }, {
    sequelize,
    modelName: 'Comment',
    timestamps: true // Automatically adds the createdAt and updatedAt fields
  });

  return Comment;
};
