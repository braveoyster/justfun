import { Service } from 'egg';

// 小程序常用方法
export default class MpUtils extends Service {
  private mpApiBase = 'https://api.weixin.qq.com/tcb/';
  private appId = 'wx034142d380891545';
  private secret = '0a23d14b6949eabbde3a828cf8686804';
  private env = 'gongfeng-f5wph';

  public async delete(query: String) {
    const method = 'databasedelete';

    try {
      const ret = this.execRequest(method, { env: this.env, query });
      return ret;
    } catch (e) {
      throw new Error(`${method}执行错误`);
    }
  }

  public async create(query: String) {
    const method = 'databaseadd';

    try {
      const ret = this.execRequest(method, { env: this.env, query });
      return ret;
    } catch (e) {
      throw new Error(`${method}执行错误`);
    }
  }

  public async query(query: String) {
    const method = 'databasequery';

    try {
      const ret = this.execRequest(method, { env: this.env, query });
      return ret;
    } catch (e) {
      throw new Error(`${method}执行错误`);
    }
  }

  private async execRequest(method: String, data: Object) {
    const acToken = await this.getMpAcToken();
    const uri = `${this.mpApiBase}${method}?access_token=${acToken}`;
    return await this.app.curl(uri, {
      method: 'POST',
      contentType: 'json',
      data,
      dataType: 'json',
      timeout: 5000
    });
  }

  public async getMpAcToken() {
    const key = 'mpApiAcToken';

    let atCache = await this.ctx.service.redis.get(key);
    if (atCache) return atCache.access_token;

    const res = await this.app.curl(`https://api.weixin.qq.com/cgi-bin/token?appid=${this.appId}&grant_type=client_credential&secret=${this.secret}`, {
      dataType: 'json',
      timeout: 5000
    });

    console.log('111111111');
    console.log(JSON.stringify(res));
    if (res.data && !res.data.err_code) {
      atCache = res.data;
      await this.ctx.service.redis.set(key, res.data, 7100);
      return atCache.access_token;
    } else {
      throw new Error('获取Mp ac token出错');
    }
  }
}
