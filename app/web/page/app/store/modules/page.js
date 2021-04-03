export default {
  namespaced: true,
  state: {
    pageName: '',
    pageDocName: '',
    styleData: {},
    styleSchema: {},
  },
  mutations: {
    setPageName(state, name) {
      state.pageName = name;
    },
    setPageDocName(state, name) {
      state.pageDocName = name;
    },
    setPageStyleData(state, data) {
      state.styleData = data;
    },
    setPageStyleSchema(state, schema) {
      state.styleData = schema;
    },
  },
  actions: {

  }
}
