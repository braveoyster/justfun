import BaseCtrl from './bases/baseCtrl';

export default class NewsController extends BaseCtrl {
  public async index() {
    const { ctx } = this;
    const data = await ctx.service.news.find();

    this.lift(data);
  }

}
