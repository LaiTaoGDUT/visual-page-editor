module.exports = {
  type: 'object',
  title: '富文本内容',
  properties: {
    text: {
      type: 'string',
      title: '文字内容',
      format: 'richText',
      description: '设置文字内容',
    },
  }
};
