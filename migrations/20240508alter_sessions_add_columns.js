'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna 'createdAt'
    await queryInterface.addColumn('Sessions', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Agregar la columna 'updatedAt'
    await queryInterface.addColumn('Sessions', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar las columnas en caso de necesitar revertir la migración
    await queryInterface.removeColumn('Sessions', 'createdAt');
    await queryInterface.removeColumn('Sessions', 'updatedAt');
  }
};
