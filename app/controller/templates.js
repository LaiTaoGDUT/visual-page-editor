// app/controller/users.js
const Controller = require('egg').Controller;
const { RESPONSE_CODE } = require('../constant/code');

class TemplateController extends Controller {
  async list() {
    const { ctx } = this;
    const { limit, offset } = ctx.query;
    const { toInt } = ctx.helper;

    const user = ctx.user;
    const list = await ctx.service.templates.getLists(
      {
        where: { 'userId': user.userId }, 
        limit: toInt(limit), 
        offset: toInt(offset),
        attributes: { exclude: ['tStyleData', 'tCompData', 'pDocName', 'userId'] }
      }
    );

    return ctx.success({ data: list });
  }

  async detail() {
    const { ctx } = this;
    const { templateId } = ctx.query;
    const { toInt } = ctx.helper;

    const user = ctx.user;

    const detail = await ctx.service.templates.getDetail(toInt(templateId));
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_TEMPLATE_PERMISSION });
    }
    return ctx.success({ data: { compData: JSON.parse(detail.tCompData), styleData: JSON.parse(detail.tStyleData) } });
  }

  async create() {
    const { ctx } = this;
    let { pageId, tName } = ctx.request.body;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);

    if (!tName) {
      return ctx.fail({ code: RESPONSE_CODE.TEMPLATE_NAME_NOT_ALLOW_EMPTY });
    }

    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const pageDetail = await ctx.service.pages.getDetail(pageId);
    if (!pageDetail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }

    const user = ctx.user;

    if (pageDetail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    const list = await ctx.service.templates.getLists({ where: { userId: user.userId }, attributes: ['tName'] });
    for (let item of list) {
      if (item.tName === tName) {
        return ctx.fail({ code: RESPONSE_CODE.TEMPLATE_NAME_REPEAT });
      }
    }

    const res = await ctx.service.templates.create(user.userId, tName, pageDetail.pStyleData, pageDetail.pCompData, pageDetail.pImageLink);
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }


  }
}

module.exports = TemplateController;