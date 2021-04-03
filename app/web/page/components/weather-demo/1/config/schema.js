module.exports = {
  type: 'object',
  title: '天气查询示例',
  properties: {
    city: {
      title: '城市',
      description: '试试输入你所在的城市',
      type: 'string',
    },
    dateTime: {
      title: '日期时间范围',
      description: '试试输入你所在的城市',
      type: 'string',
      format: 'date-time'
    },
    color: {
      title: '颜色',
      description: '试试输入颜色',
      type: 'string',
      format: 'color',
    },
    image: {
      title: '图片上传实例',
      description: '试试上传图片',
      type: 'string',
      format: 'image',
    },
    jsonExample: {
      title: 'json实例',
      description: '试试json实例',
      type: 'object',
    },
    mutiSelect: {
      title: '多选实例',
      description: '试试多选实例',
      type: 'array',
      items: {
        type: 'string',
      },
      enum: ['apple', 'banana', 'pear'],
      uniqueItems: true,
    },
    objectArray: {
      title: '对象数组实例',
      description: '试试对象数组实例',
      type: 'array',
      items: {
        type: 'object',
        title: '对象数组实例',
        properties: {
          name: {
            type: 'string',
            title: '名字',
            description: '试试填写名字',
          },
          age: {
            type: 'number',
            title: '年龄',
            description: '试试填写年龄',
          },
          other: {
            type: 'object',
            title: '其它选项',
            description: '填写其它选项',
            properties: {
              sex: {
                type: 'string',
                title: '性别',
                description: '试试填写性别',
              },
              color: {
                type: 'string',
                format: 'color',
                title: '喜欢的颜色',
                description: '填写喜欢的颜色',
              },
            }
          }
        }
      },
      defaultItem: {
        "name": "Jack",
        "age": 10,
        "other": {
          "sex": "Male",
          "color": "#000"
        }
      }
    },
    normalArray: {
      title: '普通数组实例',
      description: '试试普通数组实例',
      type: 'array',
      items: {
        type: 'string',
      },
      defaultItem: 'new Item'
    }
  }
};