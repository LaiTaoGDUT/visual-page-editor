const Service = require('egg').Service;

class ComponentService extends Service {
  async getLists(query) {
    const { ctx } = this;
    const lists = await ctx.model.Components.findAll(query);
    return lists;
  }
  async getDetail(id) {
    const { ctx } = this;
    const query = {
      where: {
        compId: id,
      }
    };
    const detail = await ctx.model.CVersion.findAll(query);
    return detail;
  }
}

module.exports = ComponentService;