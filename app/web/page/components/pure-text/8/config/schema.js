module.exports = {
  type: 'object',
  title: '纯文本',
  properties: {
    text: {
      type: 'string',
      title: '文字内容',
      format: 'textarea',
      description: '设置文字内容',
    },
    alignment: {
      type: 'string',
      title: '文本对齐方式',
      description: '设置文本的对齐方式',
      enum: ['左对齐','居中对齐','右对齐']
    },
    leadingSpace: {
      type: 'boolean',
      title: '句首空格',
      description: '设置是否在句首留出空格，仅在文本为“左对齐”时有效。',
      switchText: ['否', '是'],
      disabled: 'this.alignment != "左对齐"'
    },
  }
};
