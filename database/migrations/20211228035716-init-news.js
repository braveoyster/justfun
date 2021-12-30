'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const {
      STRING, INTEGER, BOOLEAN, DATE
    } = Sequelize;

    await queryInterface.createTable('news', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      text: STRING(255),
      url: STRING(2000),
      pub_date: DATE,
      pub_data_ts: INTEGER,
      pub_date_ts: INTEGER,
      source_link: STRING(2000),
      news_type: INTEGER,
      is_deleted: BOOLEAN,
      created_at: DATE,
      updated_at: DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
