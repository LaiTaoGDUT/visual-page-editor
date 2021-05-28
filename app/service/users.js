const Service = require('egg').Service;
const { genPassword } = require('../utils/crypto');

class UsersService extends Service {
  async login(email, password) {
    const { ctx } = this;
    const where = {
      uMail: email,
      uPassword: password
    }
    const user = await ctx.model.Users.findOne({ where, excludes: ['uPassword'] });
    return user;
  }
  async checkLogin() {
    const { ctx } = this;
    const userId = ctx.session.identity;
    const userToken = ctx.cookies.get('_iToken');
    if (genPassword(userId) === userToken) {
      const user = await ctx.model.Users.findOne({ where: { userId }, excludes: ['uPassword'] });
      if (user) {
        return user;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async checkEmailRepeat(email) {
    const { ctx } = this;
    const userNum = await ctx.model.Users.count({ where: { uMail: email } });
    return userNum > 0;
  } 

  async register(email, username, password) {
    const  { ctx } = this;
    return await ctx.model.Users.create({
      uMail: email,
      uName: username,
      uPassword: password,
    });
  }
}

module.exports = UsersService;