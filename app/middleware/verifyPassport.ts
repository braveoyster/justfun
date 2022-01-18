import { Context } from 'egg';

// 验证登录中间件
export default (options: any, app: any) => {
  console.log('options ..................... ', options);
  return async (ctx: Context, next) => {
    const { config } = app;
    const whiteIgnore = config.auth.ignores;
    ctx.logger.info('origin ==============>', ctx.get('origin'));
    const passLogin = whiteIgnore.some((url) => {
      if (typeof url === 'string') {
        return url === ctx.path;
      }
      return url.test(ctx.path);
    });

    if (passLogin) {
      await next();
      return true;
    }
    const signs = ctx.header.pspt;
    let isExecNext: boolean = false; // 是否执行下一步
    console.log(signs);
    if (!signs) {
      // throw new Error('Require login first!');
      ctx.status = 401;
      return ctx.body = {
        err_code: 401,
        code: 401,
        message: 'Invalid token',
      };
    }

    try {
      let verifyResult = await ctx.service.common.auth.verifySign(signs.toString());

      console.log('verifyResult ................ ', verifyResult);
      if (!verifyResult) {
        ctx.hasLogin = false;
        ctx.status = 401;
        ctx.body = {
          err_code: 401,
          code: 401,
          message: 'Invalid token',
        };
      } else {
        isExecNext = true;
      }
    } catch (e) {
      ctx.app.emit('error', e, ctx);
      ctx.logger.error('verify login failed ................... ', e);
      // throw new Error('Require login first~')
    }

    if (isExecNext) await next();
  };
};
