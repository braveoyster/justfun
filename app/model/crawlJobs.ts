import { Application } from 'egg';

// 返回客户端 课程包
export default (app: Application) => {
  const {
    STRING, INTEGER, BOOLEAN, DATE, NOW
  } = app.Sequelize;

  const CrawlJobs: any = app.model.define(
    'crawl_jobs',
    {
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
      pub_date_ts: {
        type: INTEGER
      },
      pub_data_ts: {
        type: INTEGER
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
    },
    {
      freezeTableName: true,
      timestamps: false,
      tableName: 'crawl_jobs'
    },
  );

  return CrawlJobs;
};
