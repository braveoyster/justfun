import { Subscription } from 'egg';

const Crawler = require('crawler');

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      disable: true,
      interval: '1m',
      type: 'worker',
      immediate: true
    };
  }

  async subscribe() {
    // 1.
    const crawler = new Crawler({
      maxConnections: 10,
      // This will be called for each crawled page
      callback: async (error, res, done) => {
        if (error) {
          console.log(error);
          done();
        }

        const $ = res.$;
        const items: any = [];
        $('.type-post').each(function(_idx, item) {
          const $item = $(item);
          const $link = $item.find('a').last();
          if ($link.text().indexOf('[博海拾贝') >= 0) {// 忽略其他
            const date = new Date($item.find('.entry-date').text().replaceAll(' ', '').replace('年', '-').replace('月', '-').replace('日',''));
            const data = {
              page_title: $link.text(),
              url: $link.attr('href'),
              pub_date: date,
              pub_data_ts: Math.round(date.getTime() / 1000), // 旧冗余字段
              pub_date_ts: Math.round(date.getTime() / 1000),
              summary: $item.find('.entry-summary').text(),
              cover: $item.find('.thumbnail-wrap').find('img').attr('src'),
              job_name: 'bhsb'
            }
            items.push(data);
            console.log(data);
          }
        });

        await this.service.crawlJobs.create(items);
        done();
      }
    });

    const urls = ['https://www.bohaishibei.com/post/category/main/'];
    for (let i = 2; i <= 50; i++) {
      urls.push(`https://www.bohaishibei.com/post/category/main/page/${i}/`)
    }

    crawler.queue(urls);

    crawler.on('drain', () => {
      // For example, release a connection to database.
      console.log('the job finished@!')
    });

  }
}
