import { Application } from 'egg';

// 返回客户端 课程包
export default (app: Application) => {
  const {
    STRING, INTEGER, BOOLEAN, DATE, NOW
  } = app.Sequelize;

  const News: any = app.model.define(
    'news',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: STRING(255),
        allowNull: false,
      },
      url: {
        type: STRING(2000),
        allowNull: true,
      },
      news_type: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pub_date: {
        type: DATE
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
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
      tableName: 'news'
    },
  );

  return News;
};
