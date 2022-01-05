import { Subscription } from 'egg';

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      cron: '* */15 16-18 * * *',
      type: 'worker'
    };
  }

  async subscribe() {
    this.ctx.logger.warn(`bhsbJob运行开始：${(new Date()).toString()}`);
    await this.service.news.syncLatest();
    this.ctx.logger.warn(`bhsbJob运行结束：${(new Date()).toString()}`);
  }
}
