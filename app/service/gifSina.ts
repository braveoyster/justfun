const Crawler = require('crawler');
import BaseService from './baseSvc';
var CJSON = require('circular-json');
/**
 * Test Service
 */
export default class Zodiac extends BaseService {

  async syncLatest() {
    const results: any = await this.crawlingDetails();
    const treats: any = [];
    results.forEach((item) => {
      const idx = treats.findIndex(p => p.name == item.name && p.timestamp == item.timestamp);
      const newObj = {
        name: item.name,
        timestamp: item.timestamp,
        [item.dtp]: item.ret
      };

      if (idx == -1) {
        treats.push(newObj);
      } else {
        treats[idx][item.dtp] = item.ret;
      }
    });
    const sql = treats.map(r => {
      return CJSON.stringify(r);
    });
    console.log('------------');
    // console.log(JSON.stringify(results));
    const detailAddSql = `db.collection("astros").add({data: [${sql.join(',')}]})`;
    console.log(detailAddSql);
    const ret = await this.service.common.mpUtils.create(detailAddSql);
    this.ctx.logger.warn(`插入结果${JSON.stringify(ret)}`);
    this.ctx.logger.warn(`本次插入数据共${sql.length}条`);
    this.ctx.logger.warn(detailAddSql);

    // return {ret};
    return {
      count: treats.length,
      treats
    };
  }

  private parseDetail(res, $con) {
    console.log(res, $con);
  }

  public async crawlingDetails(num: number = 12) {
    const items: object[] = [];
    return new Promise((resolve) => {

      const crawler = new Crawler({
        maxConnections: 10,
        rateLimit: 1000,
        rotateUA:true,//开启 User-Agent 请求头的切换，userAgent 必须为数组
        userAgent:['Mozilla/5.0 (Windows NT 10.0; WOW64)','AppleWebKit/537.36 (KHTML, like Gecko)','Chrome/55.0.2883.87 Safari/537.36'],
        callback: async (error, res, done) => {
          if (error) {
            console.log(error);
            done();
          }

          const $ = res.$;
          const $det = $('.det');
          console.log($det.text());
          const item: any = this.parseDetail(res, $det);

          items.push(item);
          // await this.service.news.create(items);
          done();
        }
      });

      const urls: object[] = [{
        uri: `https://interface.sina.cn/tech/gif/album.d.json?format=json&num=${num}&page=1&jsoncallback=getDataJson`
      }];

      crawler.queue(urls);

      crawler.on('drain', () => {
        console.log('the d1xz job finished@!')
        console.log(items);
        return resolve(items);
      });
    });
  }
}
