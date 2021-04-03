// app/controller/users.js
const Controller = require('egg').Controller;

class ComponentController extends Controller {
  async list() {
    const { ctx, app } = this;
    const { limit, offset } = ctx.query;
    const { toInt } = ctx.helper;
    const Op = app.Sequelize.Op;

    const list = await ctx.service.components.getLists({ where: {'cType': {[Op.not]: '自定位'}}, limit: toInt(limit), offset: toInt(offset) });

    // 格式化返回值
    let typeMaps = new Map();
    list.forEach((item) => {
      const typeLists = typeMaps.get(item.cType);
      if (!typeLists) {
        typeMaps.set(item.cType, [item]);
      } else {
        typeLists.push(item);
      }
    });
    let formatLists = {};
    for(let [type, list] of typeMaps.entries()) {
      formatLists[type] = list;
    }

    return ctx.success({ data: formatLists });
  }
  
  async pList() {
    const { ctx } = this;
    const { limit, offset } = ctx.query;
    const { toInt } = ctx.helper;

    const list = await ctx.service.components.getLists({ where: { cType: '自定位'}, limit: toInt(limit), offset: toInt(offset) });

    return ctx.success({ data: list });
  }

  async detail() {
    const { ctx } = this;
    const { id } = ctx.query;
    const { toInt } = ctx.helper;

    const detailList = await ctx.service.components.getDetail(toInt(id));
    detailList.forEach((detail) => {
      detail.defaultData = JSON.parse(detail.defaultData);
      detail.cSchema = JSON.parse(detail.cSchema);
      detail.defaultStyle = JSON.parse(detail.defaultStyle);
      detail.cStyleSchema = JSON.parse(detail.cStyleSchema);
    })
    return ctx.success({ data: detailList }); 
  }
}

module.exports = ComponentController;