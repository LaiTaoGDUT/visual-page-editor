const Service = require('egg').Service;

class PHistoryService extends Service {
  async createHistory(page, saveType) {
    const { ctx } = this;
    return await ctx.model.PHistorys.create({
      pageId: page.pageId,
      userId: page.userId,
      pName: page.pName,
      pDocName: page.pDocName,
      createTime: page.updateTime,
      pStyleData: page.pStyleData,
      pCompData: page.pCompData,
      saveType
    });
  }

  async getLists(query) {
    const { ctx } = this;

    const pHistoryModel = ctx.model.PHistorys;
    const userModel = ctx.model.Users;
    
    userModel.hasMany(pHistoryModel, {
      foreignKey: 'userId',
    });
    pHistoryModel.belongsTo(userModel, {
      foreignKey: 'userId',
    });

    const attributes = ['pHistoryId', 'createTime', 'saveType'];
    const include = [{model: userModel, attributes: ['uName'], as: 'user'} ];
    const lists = await ctx.model.PHistorys.findAll({...query, include, attributes});
    return lists;
  }

  async getDetail(query) {
    const { ctx } = this;
    return await ctx.model.PHistorys.findOne(query);
  }
}

module.exports = PHistoryService;