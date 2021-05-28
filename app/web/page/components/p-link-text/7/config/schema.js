module.exports = {
  type: 'object',
  title: '文字链接',
  properties: {
    address: {
      type: 'string',
      title: '跳转地址',
      description: '设置链接的跳转地址',
      pattern: '^(http)s?:[/]{2}',
      placeHolder: 'http://',
      errorTips: '接口地址需以http://或https://开头'
    },
    text: {
      type: 'string',
      title: '文字内容',
      description: '设置链接的文字内容，不填写时自动使用跳转地址填充',
      errorTips: '不填写时自动使用跳转地址填充'
    },
    newWinOpen: {
      type: 'boolean',
      title: '是否新窗口打开',
      description: '设置链接跳转的网页是否新窗口打开',
      switchText: ['否', '是'],
    },
    underline: {
      type: 'string',
      title: '下划线显示时机',
      description: '设置下划线的显示时机',
      enum: ['始终显示', 'hover时显示', '始终隐藏']
    }
  }
};
