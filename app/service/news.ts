const Crawler = require('crawler');
import BaseService from './baseSvc';
/**
 * Test Service
 */
export default class News extends BaseService {
  async queryMpLatest() {

    const query = `db.collection("list").orderBy("pub_data_ts", "desc").limit(1).get()`;
    const res = await this.service.common.mpUtils.query(query);

    return res.data;
  }

  async removeListRecords(startTs: Number) {
    return await this.service.common.mpUtils.delete(`db.collection("list").where({pub_data_ts:_.gte(${startTs})}).remove()`);
  }

  async removeDetailRecords(startTs: Number) {
    return await this.service.common.mpUtils.delete(`db.collection("news").where({pub_data_ts:_.gte(${startTs})}).remove()`);
  }

  async syncLatest() {

    const latest = await this.queryMpLatest();

    const entry = JSON.parse(latest.data[0]);
    console.log(entry.pub_data_ts);
    const posts: any = await this.crawlList(3);

    const crawls = posts.filter( post => post.pub_data_ts > entry.pub_data_ts);

    const results: any = await this.crawlPostDetail(crawls);

    // insert the data
    // 1. list
    const list = crawls.map(item => {
      const firstItem = results.filter(r => r.pub_data_ts == item.pub_data_ts);
      item.cover = firstItem[0].url;

      return JSON.stringify(item);
    });
    const listAddSql = `db.collection("list").add({data: [${list}]})`;
    const ret = await this.service.common.mpUtils.create(listAddSql);
    console.log('------------------------');
    console.log(ret);

    // 2. detail
    const news = results.map(item => {
      return JSON.stringify(item);
    });

    const detailAddSql = `db.collection("news").add({data: [${news}]})`;
    const ret2 = await this.service.common.mpUtils.create(detailAddSql);
    return {ret, ret2};
  }

  async crawlPostDetail(posts: any[]) {
    const items: any = [];
    return new Promise((resolve) => {
      const crawler = new Crawler({
        maxConnections: 10,
        callback: async (error, res, done) => {
          if (error) {
            console.log(error);
            done();
          }

          const $ = res.$;
          const $ps = $('.entry-content').find('p');
          $ps.each(function(idx, item) {
            if ((idx + 1) % 2 == 1) {
              items.push({
                text: $(item).text(),
                url: $ps.eq(idx + 1).find('img').attr('src'),
                pub_date: res.options.pub_date,
                pub_data_ts: res.options.pub_data_ts
              })
            }
          });

          // await this.service.crawlJobs.update(res.options.parameter1, {
          //   crawl_status: 1
          // });

          // await this.service.news.create(items);
          done();
        }
      });

      const urls = posts.map((item) => ({
        uri: item.url,
        id1: item.id,
        pub_date: item.pub_date,
        pub_data_ts: item.pub_data_ts
      }));

      crawler.queue(urls);

      crawler.on('drain', () => {
        console.log('the crawlPostDetail finished@!')
        console.log(items);
        return resolve(items);
      });
    });
  }

  async crawlList(limit: number) {
    const items: any = [];
    return new Promise((resolve) => {
      const crawler = new Crawler({
        maxConnections: 10,
        callback: async (error, res, done) => {
          if (error) {
            console.log(error);
            done();
          }

          const $ = res.$;
          const $posts = $('.type-post');
          for (let i = 0; i < limit; i++) {
            const $item = $posts.eq(i);
            const $link = $item.find('a').last();
            if ($link.text().indexOf('[博海拾贝') < 0 ) continue;

            const date = new Date($item.find('.entry-date').text().replaceAll(' ', '').replace('年', '-').replace('月', '-').replace('日', ''));
            const data = {
              page_title: $link.text(),
              url: $link.attr('href'),
              pub_date: date,
              pub_data_ts: Math.round(date.getTime() / 1000),
              summary: $item.find('.entry-summary').text(),
              cover: $item.find('.thumbnail-wrap').find('img').attr('src'),
              job_name: 'bhsb'
            }
            items.push(data);
            // console.log(data);
          }

          // await this.service.crawlJobs.create(items);
          done();
        }
      });

      const urls = ['https://www.bohaishibei.com/post/category/main/'];

      crawler.queue(urls);

      crawler.on('drain', () => {
        // For example, release a connection to database.
        console.log('the job finished@!')
        return resolve(items);
      });
    });
  }

  async find() {
    const { app: { model } } = this;
    const { whereFilters, options } = this.formatQueryParams([
    ]);

    const resp = await model.News.findAndCountAll({
      where: {
        ...whereFilters,
      },
      ...options,
      order: [['created_at', 'DESC']],
    });

    return {
      results: resp.rows,
      length: resp.rows.length,
      total: resp.count,
    };
  }

  async create(items: any) {
    const ret = await this.bulkCreateResources('News', items);
    return ret;
  }

  public async crawlingDetails() {
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
        const $ps = $('.entry-content').find('p');
        $ps.each(function(idx, item) {
          if ((idx + 1) % 2 == 1) {
            items.push({
              text: $(item).text(),
              url: $ps.eq(idx + 1).find('img').attr('src'),
              pub_date: res.options.parameter2
            })
          }
        });

        await this.service.crawlJobs.update(res.options.parameter1, {
          crawl_status: 1
        });

        await this.service.news.create(items);
        done();
      }
    });

    const { app: { model } } = this;

    const jobs = await model.CrawlJobs.findAll({
      where: {
        crawl_status: 0,
        is_deleted: 0
      },
      limit: 2000,
      order: [['pub_date', 'desc']],
    });

    console.log(jobs.length);
    const urls = jobs.map((item) => ({
      uri: item.url,
      parameter1: item.id,
      parameter2: item.pub_date
    }));

    crawler.queue(urls);

    crawler.on('drain', () => {
      // For example, release a connection to database.
      console.log('the job finished@!')
    });
  }
}
