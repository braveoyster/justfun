import BaseCtrl from './bases/baseCtrl';

export default class NewsController extends BaseCtrl {
  public async index() {
    const { ctx } = this;
    const data = await ctx.service.news.find();

    this.lift(data);
  }

  public async insert() {
    const { ctx } = this;
    const { text, src } = ctx.request.query;
    const data = await ctx.service.news.insert(text, src);

    this.lift(data);
  }

  public async discoverLatest() {
    const { ctx } = this;
    const data = await ctx.service.news.queryMpLatest();

    this.lift(data);
  }

  public async syncLatest() {
    const { ctx } = this;
    const data = await ctx.service.news.syncLatest();

    this.lift(data);
  }

  public async removeListRecords() {
    const { ctx } = this;
    const { startts } = this.ctx.params;

    const data = await ctx.service.news.removeListRecords(startts);

    this.lift(data);
  }

  public async removeDetailRecords() {
    const { ctx } = this;
    const { startts } = this.ctx.params;

    const data = await ctx.service.news.removeDetailRecords(startts);

    this.lift(data);
  }
}
