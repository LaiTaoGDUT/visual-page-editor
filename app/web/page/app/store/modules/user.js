export default {
  namespaced: true,
  state: {
    userInfo: null, // 用户信息
  },
  getters: {

  },
  mutations: {
    setInfo(state, info) {
      state.userInfo = info;
    },
  },
}
