const Service = require('egg').Service;
const moment = require('moment');

class ComponentService extends Service {
  async getLists(query) {
    const { ctx } = this;
    const lists = await ctx.model.Templates.findAll(query);
    return lists;
  }
  async getDetail(id) {
    const { ctx } = this;
    const query = {
      where: {
        templateId: id,
      }
    };
    const detail = await ctx.model.Templates.findOne(query);
    return detail;
  }
  async create(userId, tName, tStyleData, tCompData, tImageLink) {
      const { ctx } = this;
      return await ctx.model.Templates.create({
        userId,
        tName,
        tStyleData,
        tCompData,
        tImageLink,
        createTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      });
  }
}

module.exports = ComponentService;