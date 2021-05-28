module.exports = {
  type: 'object',
  title: '文字链接',
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
    color: {
      type: 'string',
      title: '文字颜色',
      description: '',
      format: 'color'
    },
    fontSize: {
      title: '字体大小',
      description: '设置表单的字体大小，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 10,
      maximum: 60,
    },
    maxWidth: {
      type: 'number',
      title: '最大宽度',
      description: '限制链接的最大宽度，文字超出后自动折行，设为0表示不进行限制',
      format: '${value}vw',
      renderTo: 'range',
      minimum: 0,
      maximum: 100,
    },
    lineHeight: {
      type: 'number',
      title: '文字行高',
      description: '设置链接文字的行高',
      format: '${value}px',
      minimum: 0,
    },
  }
};
