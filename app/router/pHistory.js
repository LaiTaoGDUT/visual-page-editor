module.exports = app => {
  const { router, controller, middleware } = app;
  const checkLogin = middleware.checkLogin();
  router.get('/api/pHistory/list', checkLogin, controller.pHistory.list);
  router.get('/api/pHistory/detail', checkLogin, controller.pHistory.detail);
};