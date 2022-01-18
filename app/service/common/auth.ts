import { Service } from 'egg';
import * as qs from 'querystring';
import * as crypto from 'crypto';

export default class Auth extends Service {
  public async verifySign(params: string) {
    const { service } = this.ctx;
    return new Promise(async (resolve, reject) => {
      const { nonce, timestamp, appid, sign } = qs.parse(params);
      const curTs = Date.now();
      const offset = 5 * 60 * 1000; // 上下浮动5min
      const validTs = Math.abs(curTs - parseInt(timestamp)) <= offset;
      if (!validTs) return reject('timestamp is invalid!');

      const nonceKey = `auth_nonce_${nonce}`;
      let atCache = await service.redis.get(nonceKey);
      if (atCache) return reject('nonce is invalid!');
      await service.redis.set(nonceKey, 1);

      const secret = this.app.config.clients[appid];
      if (!secret) return reject('appid is invalid!');

      // order the params
      const md5 = crypto.createHash('md5');
      const sign_val = md5.update(`${appid}${nonce}${timestamp}${secret}`).digest('hex');
      console.log('---------------');
      console.log(sign_val);
      console.log(sign);
      if (sign_val !== sign) return reject(false);

      return resolve(true);
    });
  }
}
