import { Subscription } from 'egg';

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      cron: '* */15 16-18 * * *',
      type: 'worker'
    };
  }

  async subscribe() {
    this.service.news.syncLatest();
  }
}
