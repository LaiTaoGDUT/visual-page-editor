// app/controller/users.js
const Controller = require('egg').Controller;
const { RESPONSE_CODE } = require('../constant/code');

class pHistoryController extends Controller {
  async list() {
    const { ctx } = this;
    let { pageId, limit, offset } = ctx.query;
    const { toInt } = ctx.helper;

    pageId = toInt(pageId);
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }

    const user = ctx.user;

    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    const list = await ctx.service.pHistory.getLists(
      {
        where: { 'pageId': pageId },
        limit: toInt(limit),
        offset: toInt(offset),
        order: [['createTime', 'DESC']]
      }
    );

    return ctx.success({ data: list });
  }

  async detail() {
    const { ctx } = this;
    let { pHistoryId } = ctx.query;
    const { toInt } = ctx.helper;

    pHistoryId = toInt(pHistoryId);
    if (isNaN(pHistoryId) || pHistoryId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }

    const user = ctx.user;

    const historyDetail = await ctx.service.pHistory.getDetail(
      {
        where: { 'pHistoryId': pHistoryId },
        attributes: { exclude: ['pageId', 'createTime', 'saveType'] }
      }
    );
    if (!historyDetail) {
      return ctx.fail({ code: RESPONSE_CODE.HISTORY_NOT_EXIST });
    }
    if (historyDetail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_HISTORY_PERMISSION });
    }
    historyDetail.userId = null;
    historyDetail.pCompData = JSON.parse(historyDetail.pCompData);
    historyDetail.pStyleData = JSON.parse(historyDetail.pStyleData);
    return ctx.success({ data: historyDetail });
  }
}

module.exports = pHistoryController;