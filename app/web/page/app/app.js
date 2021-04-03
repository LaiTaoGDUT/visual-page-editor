'use strict';
import Vue from 'vue';
import router from '@/router';
import store from '@/store';

import '@/plugins/andt-design-vue';
import '@/plugins/element-ui';
import '@/plugins/moment';

import '@/filters';
import '@/directives';

import '@/asset/css/index.css';

import App from './App.vue';

const options = { base: '/' };

new Vue({
  components: { App },
  router,
  store,
  options,
  template: '<App/>'
}).$mount('#app');

