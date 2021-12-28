import { Service } from 'egg';

export default class RedisService extends Service {
  public async get(key: string) {
    const { app } = this as any;
    const result = await app.redis.get(key);

    try {
      return JSON.parse(result);
    } catch (e) {
      return result;
    }
  }

  public async set(key: string, value: any, time = 300, mod = 'EX') {
    const { app } = this;
    let saveStr = '';
    try {
      saveStr = JSON.stringify(value);
    } catch (e) {
      saveStr = value;
    }
    if (time > 0) { app.redis.set(key, saveStr, mod, time); } else { app.redis.set(key, saveStr); }
  }

  public async del(key) {
    const { app } = this as any;

    await app.redis.del(key);
  }

  public async keys(key: string) {
    const { app } = this;

    return app.redis.keys(key);
  }

  public async batchDel(key: string) {
    const keys: any[] = await this.keys(key);

    if (keys) {
      await Promise.all(keys.map((k) => this.del(k)));
    }
  }

  async incr(key: string) {
    return this.app.redis.incr(key);
  }

  async incrby(key: string, increment: number) {
    return this.app.redis.incrby(key, increment);
  }

  async exists(...keys: (string | Buffer)[]) {
    return this.app.redis.exists(...keys);
  }

  async zadd(key: string, score: number, val: string) {
    return this.app.redis.zadd(key, score, val);
  }

  async zrevrank(key: string, member: string) {
    return this.app.redis.zrevrank(key, member);
  }

  async zrevrange(key: string, start: number, end: number) {
    return this.app.redis.zrevrange(key, start, end);
  }

  async zincrby(key: string, increment: number, member: string) {
    return this.app.redis.zincrby(key, increment, member);
  }

  async zpopmin(key: string) {
    return this.app.redis.zpopmin(key);
  }

  async zpopmax(key: string) {
    return this.app.redis.zpopmax(key);
  }

  async zcard(key: string) {
    return this.app.redis.zcard(key);
  }

  async ttl(key: string) {
    return this.app.redis.ttl(key);
  }

  async lpush(key: string, ...args: any[]) {
    return this.app.redis.lpush(key, ...args);
  }

  async rpop(key: string) {
    return this.app.redis.rpop(key);
  }

  async lrange(key: string, start: number, stop: number) {
    return this.app.redis.lrange(key, start, stop);
  }

  async lrem(key: string, count: number, value: any) {
    return this.app.redis.lrem(key, count, value);
  }

  async brpop(key: string, timeout: number) {
    return this.app.redis.brpop(key, timeout);
  }

  async llen(key: string) {
    return this.app.redis.llen(key);
  }

  async subscribe(channel: string) {
    return this.app.redis.subscribe(channel);
  }

  async publish(channel: string, message: string) {
    return this.app.redis.publish(channel, message);
  }

  async eval(script: string, numKeys: number, ...args: any[]) {
    return this.app.redis.eval(script, numKeys, ...args);
  }

  async hincr(key: string, field: string) {
    return this.app.redis.hincrby(key, field, 1);
  }

  async hincrby(key: string, field: string, increment: number) {
    return this.app.redis.hincrby(key, field, increment);
  }

  async hset(key: string, field: string, value: any) {
    return this.app.redis.hset(key, field, value);
  }

  async hget(key: string, field: string) {
    return this.app.redis.hget(key, field);
  }

  async hmget(key: string, ...fields: string[]) {
    return this.app.redis.hmget(key, ...fields);
  }

  async hdel(key: string, field: string) {
    return this.app.redis.hdel(key, field);
  }
}
