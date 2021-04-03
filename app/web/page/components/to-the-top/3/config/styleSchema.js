module.exports = {
  type: 'object',
  title: '天气查询示例',
  properties: {
    position: {
      type: 'object',
      title: '定位',
      description: '',
      format: 'position',
      properties: {
        zIndex: {
          title: '堆叠层级',
          description: '自定位组件在当前堆叠上下文中的堆叠层级，当自定位组件之间重叠的时候， zIndex 较大的元素会覆盖较小的元素在上层进行显示，设置为负数时将被普通组件遮盖',
          type: 'number'
        },
        targeting: {
          title: '定位方式',
          description: '指定自定位组件在文档中的定位方式，fixed：相对于窗口定位，absolute：相对于文档定位',
          type: 'string',
          enum: ['fixed', 'absolute'],
          disabled: true
        }
      }
    },
    visibilityHeight: {
      type: 'number',
      title: '显示高度',
      description: '组件会在滚动高度达到该值时才出现',
      minimum: 0
    },
    backgroundColor: {
      type: 'string',
      title: '背景颜色',
      description: '',
      format: 'color'
    }
  }
};
