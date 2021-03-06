import { Subscription } from 'egg';

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      disable: true,
      cron: '* 03 0 * * *',
      type: 'worker',
      // interval: '5s',
      // immediate: true
    };
  }

  async subscribe() {
    const tmp = await this.service.redis.get('gifsinaJob_tmp');
    if (tmp && tmp.pendding) {
      console.log(tmp);
      return; // already has job running
    }
    await this.service.redis.set('gifsinaJob_tmp', { pendding: true });

    this.ctx.logger.warn(`gifsinaJob运行开始：${(new Date()).toString()}`);
    await this.service.zodiac.syncLatest();
    this.ctx.logger.warn(`gifsinaJob运行结束：${(new Date()).toString()}`);
  }
}
