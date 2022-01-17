import BaseCtrl from './bases/baseCtrl';

export default class SinaController extends BaseCtrl {
  public async fetchDetail() {
    const { ctx } = this;
    const { mid } = this.ctx.params;
    const data = await ctx.service.sinaSvc.fetchDetail(mid);

    this.lift(data);
  }
}
