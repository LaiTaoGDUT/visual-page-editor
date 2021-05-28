module.exports = {
  type: 'object',
  title: '通用表单',
  properties: {
    submitLink: {
      title: '数据提交接口',
      type: 'string',
      description:`设置表单数据提交的接口地址，表单使用post方法提交，请设置正确的返回数据，返回数据对象示例：<pre><code>
{
  "status": 200 // 无论提交成功与否，均需要返回200
  "code": 200, // code为200表示提交成功，其它数字表示提交失败
  "msg": "",   // 需要给予用户的提示内容
}</code></pre>`,
      pattern: '^(http)s?:[/]{2}',
      placeHolder: 'http://',
      errorTips: '接口地址需以http://或https://开头'
    },
    submitText: {
      title: '提交按钮文字',
      type: 'string',
      description:'设置提交按钮的文字',
      minLength: 1,
    },
    clearText: {
      title: '清空按钮文字',
      type: 'string',
      description:'设置清空按钮的文字，若设置为空则表示隐藏清空按钮',
    },
    aftSuccess: {
      title: '提交成功后操作',
      type: 'string',
      description:'设置提交成功后需要进行的操作',
      enum: ['清空输入', '维持原状']
    },
    aftFailed: {
      title: '提交失败后操作',
      type: 'string',
      description:'设置提交失败后需要进行的操作',
      enum: ['清空输入', '维持原状']
    },
    successText: {
      title: '提交成功提示文字',
      type: 'string',
      description: '设置提交成功后显示的提示文字，会覆盖接口返回消息的msg字段。'
    },
    failText: {
      title: '提交失败提示文字',
      type: 'string',
      description: '设置提交失败后显示的提示文字，会覆盖接口返回消息的msg字段。'
    },
    itemList: {
      title: '表单项列表',
      description: '配置或删除表单中含有的表单项',
      type: 'array',
      items: {
        type: 'object',
        title: '表单项',
        properties: {
          type: {
            title: '表单项类型',
            type: 'string',
            description: '设置表单项的类型',
            enum: ['单行输入框', '多行输入框', '下拉选择框', '垂直单选框']
          },
          name: {
            title: '字段名',
            type: 'string',
            description: '提交到服务器时该表单项的数据字段名，若字段名重复则取最后一个',
            minLength: 1,
          },
          label: {
            title: '标签名',
            type: 'string',
            description: '该表单项在页面中显示的标签名',
            minLength: 1,
          },
          placeholder: {
            title: '占位文本',
            type: 'string',
            description: '设置当输入框内容为空时显示的文本',
            disabled: 'this.type == "垂直单选框"' 
          },
          need: {
            title: '必填项提示文字',
            type: 'string',
            description: '请输入必填项的错误提示文字，若配置为空，则表示该输入项为非必填', 
          },
          limit: {
            title: '文字数量限制',
            type: 'number',
            description: '设置输入框限制的文字数量，设为0表示不限制数量。仅在类型不为“下拉选择框”时有效，当类型为“垂直单选框”时，可用于限制“自定义内容”的文字数量',
            minimum: 0,
            disabled: 'this.type == "下拉选择框" || this.type == "垂直单选框"' 
          },
          autoSize: {
            title: '自适应内容高度',
            type: 'boolean',
            description: '设置内容溢出时输入框的高度是否自适应内容高度，仅在类型为“多行输入框”时有效',
            switchText: ['否', '是'],
            disabled: 'this.type != "多行输入框"'
          },
          optionList: {
            title: '选项列表',
            type: 'string',
            description: '设置下拉选择框的可选项，以“,”隔开。仅在类型为“下拉选择框”或“垂直单选框”时有效',
            disabled: 'this.type != "下拉选择框" && this.type != "垂直单选框"',
            placeHolder: '请以“,”隔开每项',         
          },
          canInputOther: {
            title: '自定义内容提示文字',
            type: 'string',
            description: '设置自定义内容的提示文字，不为空则允许用户在类型为“垂直单选框”时，输入自定义的内容',
            disabled: 'this.type != "垂直单选框"',
          }
        }
      },
      defaultItem: {
        "type": "单行输入框",
        "name": "simpleInput",
        "label": "单行输入框",
        "placeholder": "请输入一些文本",
        "need": '该项为必填项',
        "limit": 20,
        "autoSize": false,
        "optionList": "",
        "canInputOther": "",
      },
    }
  }
};
