const Service = require('egg').Service;
const moment = require('moment');

class PagesService extends Service {
  async getLists(query) {
    const { ctx } = this;
    const lists = await ctx.model.Pages.findAll(query);
    return lists;
  }
  async getDetail(pageId) {
    const { ctx } = this;
    const where = {
      pageId: pageId,
    }
    return await ctx.model.Pages.findOne({ where });
  }

  async create(userId, pName) {
    const { ctx } = this;
    return await ctx.model.Pages.create({
      userId: userId,
      pName: pName,
      pDocName: pName,
      createTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      updateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      pStyleData: JSON.stringify({
        backgroundColor: 'rgba(255, 255, 255, 0)',
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundWidth: '100%',
        backgroundHeight: '100%',
        backgroundRepeat: false,
        fontSize: 12,
      }),
      pCompData: JSON.stringify({components: [], pComponents: []}),
      locked: false,
    });
  }

  async delete(pageId) {
    const { ctx } = this;
    const where = {
      pageId: pageId
    }
    return await Promise.all([ctx.model.Pages.destroy({ where }), ctx.model.PVersion.destroy({ where })]) ;
  }

  async saveCompData(pageId, compData, styleData, shoot) {
    const { ctx } = this;
    const where = {
      pageId: pageId,
    }
    return await ctx.model.Pages.update({ pCompData: compData, pStyleData: styleData, pImageLink: shoot, updateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') }, { where });
  }

  async saveBaseInfo(pageId, pageName, pageDocName) {
    const { ctx } = this;
    const where = {
      pageId: pageId,
    }
    return await ctx.model.Pages.update({ pName: pageName, pDocName: pageDocName, updateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') }, { where });
  }

  async getVersionList(pageId) {
    const { ctx } = this;
    const where = {
      pageId: pageId,
    }
    return await ctx.model.PVersion.findAll({ where, attributes: { exclude: ['pStyleData', 'pCompData'] }, order: [['createTime', 'DESC']] });
  }

  async createVersion(pageId, versionName, pDocName, pStyleData, pCompData) {
    const { ctx } = this;
    return await ctx.model.PVersion.create({
      pVersionName: versionName,
      pageId: pageId,
      pDocName: pDocName,
      createTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      pStyleData: pStyleData,
      pCompData: pCompData,
      publish: false,
    });
  }

  async getVersionDetail(where) {
    const { ctx } = this;
    return await ctx.model.PVersion.findOne( { where });
  }

  async offVersion(versionId) {
    const { ctx } = this;
    const where = {
      pVersionId: versionId
    }
    return await ctx.model.PVersion.update({ publish: false }, { where });
  }

  async publishVersion(versionId) {
    const { ctx } = this;
    const where = {
      pVersionId: versionId
    }
    return await ctx.model.PVersion.update({ publish: true }, { where });
  }
}

module.exports = PagesService;