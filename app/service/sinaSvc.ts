import BaseService from './baseSvc';
/**
 * Test Service
 */
export default class News extends BaseService {
  async fetchDetail(mid: string) {
    return this.requestPage(mid);
  }

  async requestPage(mid: string) {
    const url = `https://m.weibo.cn/detail/${mid}`;
    const res = await this.ctx.curl(url);
    const reg = /"urls"\:[\w\W]*?\}/gim; // 解析视频地址
    const body = res.data.toString();
    const matches = body.match(reg);
    return JSON.parse('{'+matches[0].replaceAll('\n', '')+'}');
  }
}
