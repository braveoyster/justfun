import { Context, Controller } from 'egg';

export default class BaseCtrl extends Controller {
  constructor(ctx: Context) {
    super(ctx);
    this.logger.info('init ctrls');
  }

  protected lift(data: any, errCode = 0, errMsg?: string) {
    let ret = data;
    if (typeof data !== 'object') {
      ret = {
        results: data,
      };
    }
    this.ctx.body = {
      ...ret,
      err_code: errCode,
      errMsg,
    };
  }
}
