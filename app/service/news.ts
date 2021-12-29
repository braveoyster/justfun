import BaseService from './baseSvc';
const Crawler = require('crawler');

/**
 * Test Service
 */
export default class News extends BaseService {
  async queryMpLatest() {
    const { app: { model } } = this;
    const { whereFilters, options } = this.formatQueryParams([
    ]);

    const query = `db.collection("news").where({done:true}).limit(10).skip(1).get()`;
    const res = await this.service.common.mpUtils.query(query);

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
