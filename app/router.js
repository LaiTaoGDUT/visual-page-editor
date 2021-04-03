
module.exports = app => {
  require('./router/render')(app);
  require('./router/users')(app);
  require('./router/components')(app);
  require('./router/templates')(app);
  require('./router/pages')(app);
};
