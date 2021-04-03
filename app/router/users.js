module.exports = app => {
  const { router, controller } = app;
  const checkLogin = app.middleware.checkLogin();
  router.post('/api/users/login', controller.users.login);
  router.get('/api/users/checkLogin', checkLogin, controller.users.checkLogin);
  router.get('/api/users/logout', controller.users.logout);
};