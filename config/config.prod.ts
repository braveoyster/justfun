import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    jwtSecret: 'justfun-secret-test',
    sequelize: {
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 20617,
      username: 'root',
      password: 'Qwe123!@#',
      database: 'justfun_prod',
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
    clients: {
      'db09d96a3479d99': '9d95f373032b72926cb3adefda99c9dcdaa31422188e15414dadba90be9519f1', // require('crypto').randomBytes(32).toString('hex'); console.log(token);
    }
  };
  return config;
};
