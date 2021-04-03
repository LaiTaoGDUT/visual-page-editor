module.exports = app => {
  const { router, controller, middleware } = app;
  const checkLogin = middleware.checkLogin();
  router.get('/api/pages/list', checkLogin, controller.pages.list);
  router.get('/api/pages/detail', controller.pages.detail);
  router.post('/api/pages/create', checkLogin, controller.pages.create);
  router.post('/api/pages/delete', checkLogin, controller.pages.delete);
  router.post('/api/pages/saveCompData', checkLogin, controller.pages.saveCompData);
  router.post('/api/pages/saveShoot', checkLogin, controller.pages.saveShoot);
  router.post('/api/pages/checkPageNameRepeat', checkLogin, controller.pages.checkPageNameRepeat);
  router.post('/api/pages/saveBaseInfo', checkLogin, controller.pages.saveBaseInfo);
  router.get('/api/pages/versionList', checkLogin, controller.pages.versionList);
  router.post('/api/pages/createVersion', checkLogin, controller.pages.createVersion);
  router.post('/api/pages/publishVersion', checkLogin, controller.pages.publishVersion);
  router.post('/api/pages/offVersion', checkLogin, controller.pages.offVersion);
  router.get('/api/pages/versionDetail', controller.pages.versionDetail); // 无需登录
  router.post('/api/pages/testNormalForm', controller.pages.testNormalForm);
};