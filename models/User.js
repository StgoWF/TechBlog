// models/User.js
module.exports = (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize;
    class User extends Sequelize.Model {}
  
    User.init({
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize, // Pass sequelize instance here
      modelName: 'User',
      timestamps: false // Directly specifying it here for clarity
    });
  
    return User;
  };
  