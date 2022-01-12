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
    const { dtp, zodiacName } = res.options;
    let ret: object = {};
    if (["today", "tomorrow"].indexOf(dtp) != -1) {
      ret = this.parseDay($con, res);
    } else if (["week", "nextweek"].indexOf(dtp) != -1) {
      ret = this.parseWeek($con, res);
    } else {
      ret = this.parseMonth($con, res);
    }

    const date = new Date(new Date().toDateString());
    return {
      dtp,
      timestamp: Math.round(date.getTime() / 1000),
      name: zodiacName,
      ret: {
        ...ret
      }
    }
  }

  private parseMonth($con, res) {
    const $ = res.$;
    const entry: any = {
      friend: [],
      enemy: [],
      love: {}
    };

    // date
    const st = $con.find('.time').text().trim().substr(5).split(' - ')[0].split('/');
    entry.date = `${st[0]}年${st[1]}月`;

    // friend
    $con.find('.left').find('span').each((_idx, el) => {
      const val = $(el).text();
      const f = val.substr(0, 2);
      const t = val.substr(2);
      entry.friend.push(f);
      entry.friend.push(t);
    });

    // enemy
    $con.find('.right').find('span').each((_idx, el) => {
      const val = $(el).text();
      const f = val.substr(0, 2);
      const t = val.substr(2);
      entry.enemy.push(f);
      entry.enemy.push(t);
    });

    // text
    entry.summary = $con.find('.week_astro_info').text();

    $con.find('.week_mod_box').each((idx, el) => {
      const $el = $(el);

      if (idx == 0 ) { // love
        const score = $el.find('strong').first().text();
        const $cs = $el.find('.week_mod_text');
        const single = $cs.first().find('p').text();
        const love = $cs.last().find('p').text();

        entry.love = {
          score,
          single,
          love
        };
      } else if (idx == 1) { // career
        const score = $el.find('strong').first().text();
        const $cs = $el.find('.week_mod_text');
        const findjob = $cs.first().find('p').text();
        const learn = $cs.last().find('p').text();

        entry.career = {
          score,
          findjob,
          learn
        };
      } else {
        const score = $el.find('strong').first().text();
        const summary = $el.find('.week_mod_istext').find('p').text();

        entry.money = {
          score,
          summary
        };
      }
    });

    // luck
    const $luck = $con.find('.week_coll_ul');
    const makeup = $luck.find('.makeup').find('p').text();
    const style = $luck.find('.dress').find('p').text();
    const activity = $luck.find('.activity').find('p').text();
    entry.luck = {
      makeup,
      style,
      activity
    };

    return entry;
  }
  private parseWeek($con, res) {
    const $ = res.$;
    const entry: any = {
      friend: [],
      enemy: [],
      love: {}
    };

    // date
    entry.date = $con.find('.time').text().trim().substr(5).split(' - ');

    // friend
    $con.find('.left').find('span').each((_idx, el) => {
      const val = $(el).text();
      entry.friend.push(val);
    });

    // enemy
    $con.find('.right').find('span').each((_idx, el) => {
      const val = $(el).text();
      entry.enemy.push(val);
    });

    // text
    entry.summary = $con.find('.week_astro_info').text();

    $con.find('.week_mod_box').each((idx, el) => {
      const $el = $(el);

      if (idx == 0 ) { // love
        const score = $el.find('strong').first().text();
        const $cs = $el.find('.week_mod_text');
        const single = $cs.first().find('p').text();
        const love = $cs.last().find('p').text();

        entry.love = {
          score,
          single,
          love
        };
      } else if (idx == 1) { // career
        const score = $el.find('strong').first().text();
        const $cs = $el.find('.week_mod_text');
        const findjob = $cs.first().find('p').text();
        const learn = $cs.last().find('p').text();

        entry.career = {
          score,
          findjob,
          learn
        };
      } else {
        const score = $el.find('strong').first().text();
        const summary = $el.find('.week_mod_istext').find('p').text();

        entry.money = {
          score,
          summary
        };
      }
    });

    // luck
    const $luck = $con.find('.week_coll_ul');
    const makeup = $luck.find('.makeup').find('p').text();
    const style = $luck.find('.dress').find('p').text();
    const activity = $luck.find('.activity').find('p').text();
    entry.luck = {
      makeup,
      style,
      activity
    };

    return entry;
  }
  private parseDay($con, res) {
    const $ = res.$;
    const entry: any = {
    };
    const fracMaps = {
      '感情': 'love',
      '健康': 'health',
      '财运': 'money',
      '工作': 'work',
      '综合': 'all'
    };

    const qyMaps = {
      '幸运颜色': 'color',
      '幸运数字': 'number',
      '速配星座': 'friend'
    };

    // date
    entry.date = $con.find('.time').text().trim().substr(5).replace('当天', '');

    // fractions
    $con.find('.fraction').find('div').each((_idx, div) => {
      const tp = $(div).find('b').text();
      console.log(tp);
      const val = $(div).find('strong').text();

      entry[fracMaps[tp]] = val;
    });

    // text
    entry.summary = $con.find('.txt > p').text();

    // quan yuan
    $con.find('.quan_yuan > li').each((_idx, li) => {
      const val = $(li).find('.words_t').text();
      const tp = $(li).find('.words_b').text();

      entry[qyMaps[tp]] = val;
    });

    return entry;
  }

  public async crawlingDetails() {
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
          const item = this.parseDetail(res, $det);

          items.push(item);
          // await this.service.news.create(items);
          done();
        }
      });
      const zodiacs = [{ name: "白羊座", flag: "Taurus" },
        { name: "金牛座", flag: "Gemini" },
        { name: "双子座", flag: "Cancer" },
        { name: "巨蟹座", flag: "Leo" },
        { name: "狮子座", flag: "Virgo" },
        { name: "处女座", flag: "Libra" },
        { name: "天秤座", flag: "Scorpio" },
        { name: "天蝎座", flag: "Sagittarius" },
        { name: "射手座", flag: "Capricorn" },
        { name: "摩羯座", flag: "Aquarius" },
        { name: "水瓶座", flag: "Pisces" },
        { name: "双鱼座", flag: "Aries" }
      ];

      const dayTypes = ["today",
        "tomorrow",
        "week",
        "nextweek",
        "month"
      ];

      const urls: object[] = [];
      dayTypes.forEach(d => {
        zodiacs.forEach(z => {
          urls.push({
            uri: `https://www.d1xz.net/yunshi/${d}/${z.flag}/`,
            zodiacName: z.name,
            dtp: d
          });
        })
      });

      crawler.queue(urls);

      crawler.on('drain', () => {
        console.log('the d1xz job finished@!')
        console.log(items);
        return resolve(items);
      });
    });
  }
}
