'use strict';
const { CODE_MESSAGES } = require('../constant/code');

module.exports = {
  /**
   * @description 成功返回
   * @param {*} { status = 200, message, data = {} }
   */

  success({ code = 200, status = 200, msg, data = {} }) {
    this.body = {
      code,
      status,
      data,
      msg: msg || CODE_MESSAGES[code],
      success: true,
    };
  },

  /**
   * @description 返回失败
   * @param {*} { code = 0, msg, data = {} }
   */

  fail({ code = 0, msg, data = {} }) {
    this.body = {
      code,
      data,
      msg: msg || CODE_MESSAGES[code],
      success: false,
    };
  },
  /**
   * @description 捕获并提取Promise错误对象
   * @param promise
   * @return [err, res]
   */
  catch(promise) {
    return promise.then(data => [null, data]).catch(error => [error, null]);
  },
};
