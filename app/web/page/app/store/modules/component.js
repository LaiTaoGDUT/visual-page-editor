export default {
  namespaced: true,
  state: {
    components: [], // 普通组件树
    currentComponentIndex: null, // 当前选中的组件序号
    pComponents: [], // 自定位组件树
    pComponentIndex: null, // 当前选中的自定位组件序号
  },
  getters: {
    currentComponent: (state) => {
      return state.components[state.currentComponentIndex];
    },
    pCurrentComponent: (state) => {
      return state.pComponents[state.pComponentIndex];
    },
    originCompList (state, getters, rootState) {
      return rootState.compLib.compList;
    },
    originPCompList (state, getters, rootState) {
      return rootState.compLib.pCompLib;
    },
  },
  mutations: {
    setComponents: (state, components) => {
      state.components = components;
    },
    insert: (state, { index, component }) => {
      state.components.splice(index, 0, component);
    },
    selectComponent: (state, index) => {
      if (index < 0 || index > state.components.length - 1) {
        state.currentComponentIndex = -1;
      }
      if (state.pComponentIndex >= 0) {
        state.pComponentIndex = -1;
      }
      state.currentComponentIndex = index;
    },
    changeComponentIndex: (state, { oldIndex, newIndex }) => {
      const component = (state.components.splice(oldIndex, 1))[0];
      state.components.splice(newIndex, 0, component);
    },
    changeComponentName: (state, { index, newName }) => {
      state.components[index].name = newName;
    },
    changeComponentVersion: (state, { index, versionId }) => {
      state.components[index].versionId = versionId;
      const componentInfo = state.originCompList.find((comp) => {
        return comp.compId === state.components[index].id;
      });
      const curVersionDetail = componentInfo.details.find(
        (detail) => detail.cVersionId == versionId
      );
      state.components[index].data = JSON.parse(JSON.stringify(curVersionDetail.defaultData));
      state.components[index].style = JSON.parse(JSON.stringify(curVersionDetail.defaultStyle));
    },
    deleteComponent: (state, { index }) => {
      state.components.splice(index, 1);
      if (state.currentComponentIndex === index) {
        state.currentComponentIndex = -1;
      }
    },
    pSetComponents: (state, components) => {
      state.pComponents = components;
    },
    pInsert: (state, component) => {
      state.pComponents.push(component);
    },
    pSelectComponent: (state, index) => {
      if (index < 0 || index > state.pComponents.length - 1) {
        state.pComponentIndex = -1;
      }
      if (state.currentComponentIndex >= 0) {
        state.currentComponentIndex = -1;
      }
      state.pComponentIndex = index;
    },
    pChangeComponentName: (state, { index, newName }) => {
      state.pComponents[index].name = newName;
    },
    pChangeComponentVersion: (state, { index, versionId }) => {
      state.pComponents[index].versionId = versionId;
      const componentInfo = state.originPCompList.find((comp) => {
        return comp.compId === state.pComponents[index].id;
      });
      const curVersionDetail = componentInfo.details.find(
        (detail) => detail.cVersionId == versionId
      );
      state.pComponents[index].data = JSON.parse(JSON.stringify(curVersionDetail.defaultData));
      state.pComponents[index].style = JSON.parse(JSON.stringify(curVersionDetail.defaultStyle));
    },
    pDeleteComponent: (state, { index }) => {
      state.pComponents.splice(index, 1);
      if (state.pComponentIndex === index) {
        state.pComponentIndex = -1;
      }
    }
  },
  actions: {
    getComponents() {

    }
  }
}
