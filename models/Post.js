// models/Post.js
module.exports = (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize;
    class Post extends Sequelize.Model {}

    Post.init({
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize, // Pasa la instancia de sequelize aquí
      modelName: 'Post',
      timestamps: false // Especificando directamente aquí para claridad
    });
  
    return Post;
};
