module.exports = {
    type: 'object',
    title: '底部导航栏',
    properties: {
      defaultSelect: {
        title: '默认菜单项',
        type: 'string',
        description: '设置默认选中的菜单项',
        enum: ['第一项', '第二项', '第三项', '第四项', '第五项'],
      },
      iconResource: {
        title: 'iconFont链接',
        type: 'string',
        description: '如需使用iconFont.cn的图标包，请在此处填写图标包的链接',
      },
      itemList: {
        title: '导航项列表',
        description: '配置或删除导航栏中含有的导航项',
        type: 'array',
        maxItems: 5,
        minItems: 1,
        items: {
          type: 'object',
          title: '导航项',
          properties: {
            icon: {
              title: '导航项图标',
              type: 'string',
              description: '设置配置项的图标，可使用antd图标,参见<a href="https://www.antdv.com/components/icon-cn/" />，如需使用iconfont.cn中的图标，请配置。',
            },
            name: {
              title: '导航项标题',
              type: 'string',
              description: '设置配置项的标题',
              minLength: 1,
            },
            link: {
              title: '导航项链接',
              type: 'string',
              description: '设置点击该导航项跳转的链接', 
              pattern: '^(http)s?:[/]{2}',
              placeHolder: 'http://',
              errorTips: '链接地址需以http://或https://开头'
            },
          }
        },
        defaultItem: {
          "icon": "home",
          "name": "主页",
          "link": "https://www.baidu.com",
        },
      }
    }
  };
  