// app/controller/users.js
const Controller = require('egg').Controller;
const { RESPONSE_CODE } = require('../constant/code');

class ComponentController extends Controller {
  async list() {
    const { ctx } = this;
    const { toInt } = ctx.helper;
    const user = ctx.user;
    const list = await ctx.service.pages.getLists({ where: { userId: user.userId }, attributes: { exclude: ['pStyleData', 'pCompData', 'pDocName'] } });
    return ctx.success({ data: list });
  }

  async detail() {
    const { ctx } = this;
    let { pageId } = ctx.query;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    return ctx.success({ data: { pName: detail.pName, pDocName: detail.pDocName, compData: JSON.parse(detail.pCompData), styleData: JSON.parse(detail.pStyleData) } });
  }

  async create() {
    const {ctx} = this;
    let { pName } = ctx.request.body;
    const userId = ctx.user.userId;

    if (!pName) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NAME_NOT_ALLOW_EMPTY })
    }

    const list = await ctx.service.pages.getLists({ where: { userId: userId }, attributes: ['pName'] });
    for (let item of list) {
      if (item.pName === pName) {
        return ctx.fail({ code: RESPONSE_CODE.PAGE_NAME_REPEAT })
      }
    }
    const res = await ctx.service.pages.create(userId, pName);
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }
  }

  async delete() {
    const {ctx} = this;
    let { pageId } = ctx.request.body;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);

    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    const res = await ctx.service.pages.delete(pageId);
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }
  }

  async savePage() {
    const {ctx} = this;
    let { pageId, saveType, ...data } = ctx.request.body;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    saveType = toInt(saveType);

    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }

    if (isNaN(saveType) || saveType < 1 || saveType > 3) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }

    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    let res = false;
    if (saveType === 1) {
      const resArr = await Promise.all([
        ctx.service.pages.saveCompData(pageId, JSON.stringify(data.compData), JSON.stringify(data.styleData), data.shoot),
        ctx.service.pages.saveBaseInfo(pageId, data.pageName, data.pageDocName)
      ])
      res = resArr.every((_res) => _res == true);
    } else if (saveType === 2) {
      res = await ctx.service.pages.saveCompData(pageId, JSON.stringify(data.compData), JSON.stringify(data.styleData), data.shoot);
    } else if (saveType === 3) {
      res = await ctx.service.pages.saveBaseInfo(pageId, data.pageName, data.pageDocName);
    }
    res = res && await ctx.service.pHistory.createHistory(await ctx.service.pages.getDetail(pageId), saveType);
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }
  }

  async checkPageNameRepeat() {
    const {ctx} = this;
    let { pageId, pageName } = ctx.request.body;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }
    const pageRepeat = await this._checkPageNameRepeat(user.userId, pageId, pageName);
    if (!pageRepeat) {
      return ctx.success({ code: RESPONSE_CODE.PAGE_NAME_REPEAT });
    } else {
      return ctx.success({});
    }
  }

  async _checkPageNameRepeat(userId, pageId, pageName) {
    const {ctx} = this;
    const list = await ctx.service.pages.getLists({ where: { userId }, includes: ['pageId', 'pName'] });
    return list.every((item) => {
      return item.pageId === pageId || item.pName !== pageName;
    });
  }

  async versionList() {
    const { ctx } = this;
    let { pageId } = ctx.query;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    const list = await ctx.service.pages.getVersionList(pageId);

    if (list) {
      return ctx.success({ data: list });
    } else {
      return ctx.fail({});
    }
  }

  async createVersion() {
    const { ctx } = this;
    let { pageId, pDocName, versionName, pStyleData, pCompData } = ctx.request.body;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }
    if (versionName.length > 16) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NAME_TOO_LONG });
    }
    if (versionName.length <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NAME_NOT_ALLOW_EMPTY });
    }

    const list = await ctx.service.pages.getVersionList(pageId);
    for(let item of list) {
      if (item.pVersionName === versionName) {
        return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NAME_REPEAT });
      }
    }
    
    const res = await ctx.service.pages.createVersion(pageId, versionName, pDocName, JSON.stringify(pStyleData), JSON.stringify(pCompData));
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }
  }

  async publishVersion() {
    const { ctx } = this;
    let { pageId, pVersionId } = ctx.request.body;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    pVersionId = toInt(pVersionId);
    
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    if (isNaN(pVersionId) || pVersionId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    const versionDetail = await ctx.service.pages.getVersionDetail({ pageId, publish: true });
    if (versionDetail) {
      if (versionDetail.pVersionId === pVersionId) {
        return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_HAS_PUBLISHED });
      }
      const offRes = await ctx.service.pages.offVersion(versionDetail.pVersionId);
      if (!offRes) {
        return ctx.fail({});
      }

    }
    const res = await ctx.service.pages.publishVersion(pVersionId);
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }
  }

  async offVersion() {
    const { ctx } = this;
    let { pageId, pVersionId } = ctx.request.body;
    const user = ctx.user;
    const { toInt } = ctx.helper;
    pageId = toInt(pageId);
    pVersionId = toInt(pVersionId);
    
    if (isNaN(pageId) || pageId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    if (isNaN(pVersionId) || pVersionId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }
    const detail = await ctx.service.pages.getDetail(pageId);
    if (!detail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_NOT_EXIST });
    }
    if (detail.userId !== user.userId) {
      return ctx.fail({ code: RESPONSE_CODE.NO_PAGE_PERMISSION });
    }

    const versionDetail = await ctx.service.pages.getVersionDetail({ pageId, pVersionId });

    if (!versionDetail) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NOT_EXIST });
    }
    if (!versionDetail.publish) {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NOT_PUBLISH });
    }

    const res = await ctx.service.pages.offVersion(pVersionId);
    if (res) {
      return ctx.success({});
    } else {
      return ctx.fail({});
    }
  }

  async versionDetail() {
    const { ctx } = this;
    let { pVersionId } = ctx.query;
    const { toInt } = ctx.helper;
    pVersionId = toInt(pVersionId);

    if (isNaN(pVersionId) || pVersionId <= 0) {
      return ctx.fail({ code: RESPONSE_CODE.PARAMS_ERROR });
    }

    const versionDetail = await ctx.service.pages.getVersionDetail({ pVersionId });
    if (versionDetail) {
      return ctx.success({ data: { pName: versionDetail.pName, pDocName: versionDetail.pDocName, publish: versionDetail.publish, compData: JSON.parse(versionDetail.pCompData), styleData: JSON.parse(versionDetail.pStyleData) } });
    } else {
      return ctx.fail({ code: RESPONSE_CODE.PAGE_VERSION_NOT_EXIST });
    }
  }

  async testNormalForm() {
    const { ctx } = this;
    let body = ctx.request.body;
    return ctx.success({msg: `您提交的数据为：${JSON.stringify(body)}`});
  }
}

module.exports = ComponentController;