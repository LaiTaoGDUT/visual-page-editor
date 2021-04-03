module.exports = app => {
  const { router, controller } = app;
  router.get('/api/components/list', controller.components.list);
  router.get('/api/components/pList', controller.components.pList);
  router.get('/api/components/detail', controller.components.detail);
};