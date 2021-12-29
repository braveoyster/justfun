import { Subscription } from 'egg';

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      interval: '1m',
      type: 'worker',
      immediate: true
    };
  }

  async subscribe() {
    await this.service.news.crawlingDetails();
  }
}
