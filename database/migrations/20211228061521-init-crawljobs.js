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
      STRING, INTEGER, BOOLEAN, DATE, NOW
    } = Sequelize;

    await queryInterface.createTable('crawl_jobs', {
id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      job_name: {
        type: STRING(255),
        allowNull: false,
      },
      page_title: {
        type: STRING(255),
        allowNull: false,
      },
      url: {
        type: STRING(2000),
        allowNull: true,
      },
      cover: {
        type: STRING(2000),
        allowNull: true,
      },
      summary: {
        type: STRING(500),
        allowNull: true
      },
      pub_date: {
        type: DATE
      },
      crawl_status: {
        type: INTEGER,
        defaultValue: 0,
      },
      is_deleted: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: NOW,
      },
      updated_at: {
        type: DATE,
        allowNull: true,
        defaultValue: NOW,
      }
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
