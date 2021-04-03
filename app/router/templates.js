module.exports = app => {
  const { router, controller } = app;
  const checkLogin = app.middleware.checkLogin();
  router.get('/api/templates/list', checkLogin, controller.templates.list);
  router.get('/api/templates/detail', checkLogin, controller.templates.detail);
  router.post('/api/templates/create', checkLogin, controller.templates.create);
};