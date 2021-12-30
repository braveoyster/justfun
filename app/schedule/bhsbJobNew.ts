import { Subscription } from 'egg';
// const url = require('url');
const Crawler = require('crawler');

export default class BhsbJob extends Subscription {
  static get schedule() {
    return {
      disable: true,
      // interval: '1m',
      type: 'worker',
      immediate: true
    };
  }

  async subscribe() {
    // 1. crawl the list pages
    const posts: any = await this.crawlList(3);

    // 2. crawl the details
    const details: any = await this.crawlPostDetail(posts);

    // set the cover with first img in the page
    // const list = posts.map(item => {
    //   const firstItem = details.filter(r => r.pub_date_ts == item.pub_date_ts);
    //   item.cover = firstItem[0].url;

    //   return item;
    // });

    // 3. write list to db
    await this.service.crawlJobs.create(posts);

    // 3. write list to db
    await this.service.news.create(details);
  }

  async crawlPostDetail(posts: any[]) {
    const items: any = [];
    return new Promise((resolve) => {
      const crawler = new Crawler({
        maxConnections: 10,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        callback: async (error, res, done) => {
          if (error) {
            console.log(error);
            done();
          }

          const $ = res.$;
          const $ps = $('.entry-content').find('p');
          $ps.each(function(idx, item) {
            if ((idx + 1) % 2 == 1) {
              const title = $(item).text();
              if (title.indexOf('【') >= 0) {// 只抓有序号的数据
                items.push({
                  text: title,
                  url: $ps.eq(idx + 1).find('img').attr('src'),
                  pub_date: res.options.pub_date,
                  pub_data_ts: res.options.pub_date_ts,
                  pub_date_ts: res.options.pub_date_ts
                })
              }
            }
          });
          console.log('crawling detail....');
          done();
        }
      });

      const urls = posts.map((item) => ({
        uri: item.url,
        id1: item.id,
        pub_date: item.pub_date,
        pub_date_ts: item.pub_date_ts
      }));

      crawler.queue(urls);

      crawler.on('drain', () => {
        console.log('the crawlPostDetail finished@!')
        // console.log(items);
        return resolve(items);
      });
    });
  }

  async crawlList(pages: number) {
    const items: any = [];
    return new Promise((resolve) => {
      const crawler = new Crawler({
        maxConnections: 10,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        callback: async (error, res, done) => {
          if (error) {
            console.log(error);
            done();
          }
          console.log('crawl post....');
          const $ = res.$;
          console.log(res.body);
          console.log(res.request.uri);
          $('.type-post').each(function(_idx, item) {
            const $item = $(item);
            const $link = $item.find('a').last();
            console.log($link.text());
            if ($link.text().indexOf('[博海拾贝') >= 0) {// 忽略其他类型的
              const date = new Date($item.find('.entry-date').text().replaceAll(' ', '').replace('年', '-').replace('月', '-').replace('日',''));
              const thumSrc = $item.find('.thumbnail-wrap').find('img').attr('src');
              const cover = new URL(thumSrc).searchParams.get('src');
              const data = {
                page_title: $link.text(),
                url: $link.attr('href'),
                pub_date: date,
                pub_data_ts: Math.round(date.getTime() / 1000), // 旧冗余字段
                pub_date_ts: Math.round(date.getTime() / 1000),
                summary: $item.find('.entry-summary').text(),
                cover,
                job_name: 'bhsb'
              }
              items.push(data);
              console.log(data);
            }
          });

          // await this.service.crawlJobs.create(items);
          done();
        }
      });

      const urls = ['https://www.bohaishibei.com/post/category/main/'];

      for (let i = 2; i <= pages; i++) {
        urls.push(`https://www.bohaishibei.com/post/category/main/page/${i}/`)
      }

      crawler.queue(urls);

      crawler.on('drain', () => {
        console.log('the job finished@!')
        return resolve(items);
      });
    });
  }
}
