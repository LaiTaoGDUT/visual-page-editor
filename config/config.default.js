const path = require('path');
const fs = require('fs');
module.exports = app => {
  const exports = {};

  exports.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'app/web/page/app/asset/images/favicon.ico'))
  };

  exports.view = {
    cache: false
  };

  // 数据库连接配置
  exports.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    password: '123456',
    database: 'visual_page_editor',
  };

  exports.vuessr = {
    layout: path.join(app.baseDir, 'app/web/view/layout.html'),
    renderOptions: {
      // 告诉 vue-server-renderer 去 app/view 查找异步 chunk 文件
      basedir: path.join(app.baseDir, 'app/view')
    }
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(app.baseDir, 'logs')
  };

  exports.static = {
    prefix: '/public/',
    dir: path.join(app.baseDir, 'public')
  };

  exports.keys = '123456';

  exports.middleware = [
    'locals',
    'access'
  ];

  exports.bodyParser = {
    enable: true,
    encoding: 'utf8',
    formLimit: '50mb',
    jsonLimit: '50mb',
    textLimit: '50mb',
    strict: true,
    // @see https://github.com/hapijs/qs/blob/master/lib/parse.js#L8 for more options
    queryString: {
      arrayLimit: 100,
      depth: 5,
      parameterLimit: 1000,
    },
    onerror(err) {
      err.message += ', check bodyParser config';
      throw err;
    },
  };

  return exports;
};
