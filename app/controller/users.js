// app/controller/users.js
const Controller = require('egg').Controller;
const { genPassword } = require('../utils/crypto');
const { RESPONSE_CODE } = require('../constant/code');

class UserController extends Controller {
  async login() {
    const ctx = this.ctx;
    const { email, password } = ctx.request.body;
    let cPassword = genPassword(password);
    const user = await ctx.service.users.login(email, cPassword);
    if (user) {
      ctx.rotateCsrfSecret(); // 刷新csrf-token
      ctx.session.identity = user.userId;
      ctx.cookies.set('_iToken', genPassword(user.userId), { maxAge: 24 * 3600 * 1000 });
      return ctx.success({ code: RESPONSE_CODE.LOGIN_SUCCESS, data: user });
    } else {
      return ctx.fail({ code: RESPONSE_CODE.LOGIN_FAIL });
    }
  }

  async checkLogin() {
    const { ctx } = this;
    return ctx.success({ code: RESPONSE_CODE.LOGIN_SUCCESS, data: ctx.user });
  }

  async logout() {
    const { ctx } = this;
    ctx.rotateCsrfSecret(); // 刷新csrf-token
    ctx.session.identity = null;
    ctx.cookies.get('_iToken', null);
    return ctx.success({});
  }

  async checkEmailRepeat() {
    const { ctx } = this;
    const { email } = ctx.query;
    const repeat = await this.service.users.checkEmailRepeat(email);
    if (repeat) {
      return ctx.success({ code: RESPONSE_CODE.EMAIL_REPEAT });
    } else {
      return ctx.success({});
    }
  }

  async register() {
    const { ctx } = this;
    const { email, username, password } = ctx.request.body;
    const repeat = await this.service.users.checkEmailRepeat(email);
    if (repeat) {
      return ctx.fail({ code: RESPONSE_CODE.EMAIL_REPEAT });
    }

    if (username.length <= 0 || username.length > 16) {
      return ctx.fail({ code: RESPONSE_CODE.USERNAME_INVALID })
    }

    if (password.length < 6 || password.length > 32) {
      return ctx.fail({ code: RESPONSE_CODE.PASS_INVALID })
    }

    let cPassword = genPassword(password);
    const user = await ctx.service.users.register(email, username, cPassword);
    if (user) {
      return ctx.success({})
    } else {
      return ctx.fail({ code: RESPONSE_CODE.REGISTER_FAIL });
    }
    
  }
}

module.exports = UserController;