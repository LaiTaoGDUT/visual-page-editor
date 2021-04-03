const Controller = require('egg').Controller;
class renderController extends Controller {
  async index(ctx) {
    await this.ctx.renderClient('app.js', { url: ctx.url });
  }
}

module.exports = renderController;