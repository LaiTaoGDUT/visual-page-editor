module.exports = {
  type: 'object',
  title: '图片链接',
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
        position: {
          title: '定位方式',
          description: '指定自定位组件在文档中的定位方式，fixed：相对于窗口定位，absolute：相对于文档定位',
          type: 'string',
          enum: ['fixed', 'absolute'],
        }
      }
    },
    width: {
      type: 'number',
      title: '宽度',
      description: '设置图片链接的宽度，设为0则表示自适应图片的宽度',
      format: '${value}px',
    },
    height: {
      type: 'number',
      title: '高度',
      description: '设置图片链接的高度，设为0则表示自适应图片的高度',
      format: '${value}px',
    },
  }
};
