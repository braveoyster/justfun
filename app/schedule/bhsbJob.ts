import { Subscription } from 'egg';

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      cron: '* */15 16-20 * * *',
      type: 'worker',
      // interval: '5s',
      // immediate: true
    };
  }

  async subscribe() {
    const tmp = await this.service.redis.get('bhsbJob_tmp');
    if (tmp && tmp.pendding) {
      console.log(tmp);
      return; // already has job running
    }
    await this.service.redis.set('bhsbJob_tmp', { pendding: true });
    this.ctx.logger.warn(`bhsbJob运行开始：${(new Date()).toString()}`);
    // await this.service.news.syncLatest();
    this.ctx.logger.warn(`bhsbJob运行结束：${(new Date()).toString()}`);
  }
}
