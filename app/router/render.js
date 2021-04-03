module.exports = app => {
  const checkLogin = app.middleware.checkLogin();
  app.get(/^(?!\/api)/, checkLogin, app.controller.render.index);
};