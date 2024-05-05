// models/Comment.js
module.exports = (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize;
    class Comment extends Sequelize.Model {}

    Comment.init({
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize, // Asegúrate de pasar la instancia de sequelize aquí
      modelName: 'Comment',
      timestamps: false // Especificando directamente aquí para claridad
    });
  
    return Comment;
};
