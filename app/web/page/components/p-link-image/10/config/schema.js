module.exports = {
  type: 'object',
  title: '图片链接',
  properties: {
    address: {
      type: 'string',
      title: '跳转地址',
      description: '设置链接的跳转地址',
      pattern: '^(http)s?:[/]{2}',
      placeHolder: 'http://',
      errorTips: '接口地址需以http://或https://开头'
    },
    newWinOpen: {
      type: 'boolean',
      title: '是否新窗口打开',
      description: '设置链接跳转的网页是否新窗口打开',
      switchText: ['否', '是'],
    },
    backgroundImage: {
      title: '图片上传',
      description: '通过本地上传图片的方式，设置链接的图片',
      type: 'string',
      format: 'image',
    },
    backgroundLink: {
      title: '图片链接',
      description: '通过网址加载的方式，设置链接的图片，使用本地图片时不可用',
      type: 'string',
      disabled: '!!this.backgroundImage'
    },
  }
};
