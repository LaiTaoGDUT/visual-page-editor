'use strict';
const { RESPONSE_CODE } = require('../constant/code');
module.exports = () => {
  return async function (ctx, next) {
    if (ctx.request.url === '/login') {
        return (await next());
    }
    const user = await ctx.service.users.checkLogin();
    if (!user) {
      if (/^(?!\/api)/.test(ctx.request.url)) {
        if (/^(?!\/preview)/.test(ctx.request.url) && /^(?!\/act)/.test(ctx.request.url)) {
          return ctx.redirect(`/login`);
        }
        return await next();
      } else {
        return ctx.fail({ code: RESPONSE_CODE.NOT_LOGIN });
      }
    } else {
      ctx.user = user;
      await next();
    }
  }
};
