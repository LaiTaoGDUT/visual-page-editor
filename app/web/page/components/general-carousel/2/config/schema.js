module.exports = {
  type: 'object',
  title: '通用轮播图',
  properties: {
    interval: {
      title: '自动轮播间隔(s)',
      description: '设置自动轮播的间隔，单位为s，设为0s则不会自动轮播',
      type: 'number',
      minimum: 0,
    },
    direction: {
      title: '轮播图展示方向',
      description: '设置展示方向来让轮播图在水平方向或垂直方向上显示，垂直方向仅在轮播图为默认风格时有效。',
      type: 'string',
      enum: ['水平', '垂直'],
    },
    arrow: {
      title: '切换箭头显示时机',
      description: '设置切换箭头的显示时机',
      type: 'string',
      enum: ['始终显示', 'hover时显示', '隐藏']
    },
    indicatorPosition: {
      title: '指示器显示位置',
      description: '设置指示器显示位置来让轮播图指示器显示在轮播图内部或外部，或隐藏指示器。仅在轮播图类型为默认时有效',
      type: 'string',
      enum: ['内部显示', '外部显示', '隐藏'],
    },
    carouselList: {
      title: '轮播图列表',
      description: '试试删除或上下移动配置项',
      type: 'array',
      items: {
        type: 'object',
        title: '轮播图',
        properties: {
          img: {
            title: '轮播图链接',
            type: 'string',
            description: '设置轮播图的获取链接，可设置为图片接口',
          },
          link: {
            title: '跳转链接',
            type: 'string',
            description: '设置点击相应轮播图跳转的链接',
          },
          desc: {
            title: '轮播图描述',
            type: 'string',
            description: '设置轮播图的描述文字，显示在轮播图左下方',
          }
        }
      },
      defaultItem: {
        "img": "http://img.xjh.me/desktop/bg/nature/64979640_p0.jpg",
        "link": "",
        "desc": ""
      },
    }
  }
};
