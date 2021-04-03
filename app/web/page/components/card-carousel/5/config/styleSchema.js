module.exports = {
  type: 'object',
  title: '卡片轮播图',
  properties: {
    height: {
      title: '高度',
      description: '设置轮播图组件的高度，单位为px',
      type: 'number',
      minimum: 0,
      format: '${value}px',
    },
    backgroundColor: {
      title: '背景颜色',
      description: '设置轮播图的背景颜色，会被轮播图覆盖',
      type: 'string',
      format: 'color',
    },
    color: {
      title: '描述文字颜色',
      description: '设置轮播图描述文字的颜色',
      type: 'string',
      format: 'color',
    },
    fontSize: {
      title: '描述文字字体大小',
      description: '设置轮播图描述文字的字体大小，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 10,
      maximum: 60,
    }
  }
};
