// models/Post.js
module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  class Post extends Sequelize.Model {}

  Post.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false, // Ensures that the title cannot be null
      validate: {
          notEmpty: true, // Prevents empty strings
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false, // Ensures that the content cannot be null
      validate: {
          notEmpty: true, // Prevents empty strings
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Ensures that the userId cannot be null
      references: {
        model: 'Users', // This refers to the table name of the User
        key: 'id'       // This is the column name of the referenced model that the foreign key points to
      }
    }
  }, {
    sequelize, // Pass the sequelize instance here
    modelName: 'Post',
    timestamps: true // Automatically adds the createdAt and updatedAt timestamp fields
  });

  return Post;
};
