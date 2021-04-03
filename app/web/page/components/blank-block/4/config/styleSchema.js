module.exports = {
  type: 'object',
  title: '占位块组件',
  properties: {
    height: {
      title: '高度（px）',
      description: '设置占位块的高度，单位为px',
      type: 'number',
      minimum: 0,
    },
    backgroundColor: {
      title: '背景颜色',
      description: '设置占位块的背景颜色，会被背景图片覆盖',
      type: 'string',
      format: 'color',
    },
    backgroundImage: {
      title: '背景图片',
      description: '设置占位块的背景图片，会覆盖背景颜色',
      type: 'string',
      format: 'image',
    },
    backgroundSize: {
      title: '背景图片大小',
      description: '设置占位块背景图片的大小，请参考<a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-size" target="blank" >background-size</a>',
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
    }
  }
};
