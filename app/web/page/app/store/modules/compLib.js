import { getCompLists, pGetCompLists } from "@/services/components";
import { message } from 'ant-design-vue';

export default {
  namespaced: true,
  state: {
    compLib: null, // 组件库
    pCompLib: null, // 自定位组件库
  },
  getters: {
    compList: (state) => {
      // 扁平化组件列表
      const list = [];
      (Object.keys(state.compLib)).forEach((type) => {
        list.push(...state.compLib[type]);
      });
      return list;
    },
  },
  mutations: {
    setCompLib(state, lib) {
      state.compLib = lib;
    },
    pSetCompLib(state, lib) {
      state.pCompLib = lib;
    }
  },
  actions: {
    async getCompLib({ commit }) {
      try {
        const res = await getCompLists();
        if (res.code === 200) {
          commit('setCompLib', res.data);
        }
      } catch (err) {
        message.error("获取组件库失败了，请刷新页面重试");
      }
    },
    async pGetCompLib({ commit }) {
      try {
        const res = await pGetCompLists();
        if (res.code === 200) {
          commit('pSetCompLib', res.data);
        }
      } catch (err) {
        message.error("获取组件库失败了，请刷新页面重试");
      }
    },
  }
}
