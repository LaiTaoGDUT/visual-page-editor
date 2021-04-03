import Vue from 'vue'
import Router from 'vue-router'
import { checkLogin } from "@/services/users";
Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import(/* webpackChunkName: "index" */ '@/views/pages/index.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
    },
    {
      path: '/edit',
      name: 'editor',
      component: () => import(/* webpackChunkName: "editor" */ '@/views/editor/index.vue'),
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import(/* webpackChunkName: "preview" */ '@/views/preview/index.vue'),
    },
    {
      path: '/act/:id',
      name: 'act',
      component: () => import(/* webpackChunkName: "publish" */ '@/views/publish/index.vue'),
    },
    {
      path: '/mind',
      name: 'mind',
      component: () => import(/* webpackChunkName: "mindExample" */ '@/views/mindExample/index.vue')
    },
    {
      path: '/jsoneditor',
      name: 'jsoneditor',
      component: () => import(/* webpackChunkName: "mindExample" */ '@/views/jsonEditor/index.vue')
    },
    {
      path:'/not-found',
      name: 'notFound',
      component: () => import(/* webpackChunkName: "404" */ '@/views/404/index.vue'), 
    },
    {
      path:'*',
      redirect: '/not-found'
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const store = router.app.$options.store;
  if (to.path === '/preview') {
    return next();
  }
  if (!store.state.compLib.compLib) {
    await store.dispatch('compLib/getCompLib');
    await store.dispatch('compLib/pGetCompLib');
  }
  if (to.path !== '/login') {
    const res = await checkLogin();
    if (res.code === 300) {
      store.commit('user/setInfo', res.data);
    } else if (res.code === 302) {
      router.redirect('/login');
    }
  }
  next();
});

router.afterEach((to, from) => {

});

export default router;


