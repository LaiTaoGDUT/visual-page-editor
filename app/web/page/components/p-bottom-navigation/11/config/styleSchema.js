module.exports = {
  type: 'object',
  title: '底部导航栏',
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
          disabled: true
        }
      }
    },
    normalColor: {
      type: 'string',
      title: '菜单项颜色',
      description: '设置菜单项的颜色',
      format: 'color'
    },
    selectColor: {
      type: 'string',
      title: '菜单项选中颜色',
      description: '设置选中菜单项的颜色',
      format: 'color'
    },
    backgroundColor: {
      title: '背景颜色',
      description: '设置导航栏的背景颜色，会被轮播图覆盖',
      type: 'string',
      format: 'color',
    },
    fontSize: {
      title: '字体大小',
      description: '设置菜单项的字体大小，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 10,
      maximum: 60,
    },
    iconSize: {
      title: '图标大小',
      description: '设置菜单项图标的大小，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 10,
      maximum: 60,
    },
    paddingTop: {
      title: '上边距',
      description: '设置导航栏主体与组件上边界的距离，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 0,
      maximum: 300,
    },
    paddingBottom: {
      title: '下边距',
      description: '设置导航栏主体与组件下边界的距离，单位为px',
      type: 'number',
      renderTo: 'range',
      format: '${value}px',
      minimum: 0,
      maximum: 300,
    },
  }
};
