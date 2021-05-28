export default {
  namespaced: true,
  state: {
    pageName: '',
    pageDocName: '',
    styleData: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundWidth: '100%',
      backgroundHeight: '100%',
      backgroundRepeat: false,
      fontSize: 12
    },
    styleSchema: {
      type: 'object',
      title: '页面样式设置',
      properties: {
        backgroundColor: {
          title: '背景颜色',
          description: '设置页面背景颜色',
          type: 'string',
          format: 'color',
        },
        backgroundImage: {
          title: '背景图片',
          description: '设置页面背景图片，将覆盖背景颜色',
          type: 'string',
          format: 'image',
        },
        backgroundSize: {
          title: '背景图片大小',
          description: '设置页面背景图片的大小，请参考<a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-size" target="blank" >background-size</a>',
          type: 'string',
          enum: ['contain', 'cover', '自定义大小'],
        },
        backgroundWidth: {
          title: '背景图片宽度',
          description: '设置背景图片的宽度，仅在背景图片大小设为“自定义大小”时有效',
          type: 'string',
          pattern: '^[0-9]+\.?[0-9]*(%|vw|vh|px)$',
          errorTips: '请输入合法的格式，eg: "100%", "100px", "100vw"。',
          disabled: 'this.backgroundSize != "自定义大小"',
        },
        backgroundHeight: {
          title: '背景图片高度',
          description: '设置背景图片的高度，仅在背景图片大小设为“自定义大小”时有效',
          type: 'string',
          pattern: '^[0-9]+\.?[0-9]*(%|vw|vh|px)$',
          errorTips: '请输入合法的格式，eg: "100%", "100px", "100vh"。',
          disabled: 'this.backgroundSize != "自定义大小"',
        },
        backgroundRepeat: {
          title: '开启背景图片重复',
          description: '设置是否重复背景图片以覆盖组件所有区域',
          type: 'boolean',
          disabled: 'this.backgroundSize != "contain"',
        },
        color: {
          title: '文字颜色',
          description: '设置页面文字的颜色',
          type: 'string',
          format: 'color',
        },
        fontSize: {
          title: '文字字体大小',
          description: '设置页面文字的字体大小，单位为px',
          type: 'number',
          renderTo: 'range',
          format: '${value}px',
          minimum: 10,
          maximum: 60,
        }
      }
    },
    baseInfoModifyFlag: false, // base info has modified ?
    componentDataModifyFlag: false, // component data and style data has modified ? 
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
      state.styleSchema = schema;
    },
    setBaseInfoModifyFlag(state, flag) {
      if (state.baseInfoModifyFlag !== !!flag) {
        state.baseInfoModifyFlag = !!flag;
      }
    },
    setComponentDataModifyFlag(state, flag) {
      if (state.componentDataModifyFlag !== !!flag) {
        state.componentDataModifyFlag = !!flag;
      }
    }
  },
  actions: {

  }
}
