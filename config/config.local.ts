import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    jwtSecret: 'justfun-secret-test',
    sequelize: {
      dialect: 'mysql',
      host: '47.94.37.100',
      port: 20617,
      username: 'root',
      password: 'qweQWE!@#',
      database: 'rd_mytikas2_dev',
      pool: {
        max: 100,
        min: 0,
        idle: 200000,
        acquire: 1000000,
      },
    },

    redis: {
      client: {
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        password: '',
      },
      app: true,
      agent: true,
    },
  };

  return config;
};
