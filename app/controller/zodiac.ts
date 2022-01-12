import BaseCtrl from './bases/baseCtrl';

export default class ZodiacController extends BaseCtrl {
  public async syncLatest() {
    const { ctx } = this;
    const data = await ctx.service.zodiac.syncLatest();

    this.lift(data);
  }
}
