import xhr from '_/xhr';

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export const get = (url, params = {}) => xhr({
  url,
  params,
  method: 'get',
}).catch((err) => {
  console.log(`${err.status || ''}：${err.statusText || ''} ${err.message || ''}`);
  return Promise.reject(err);
});

/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} data [请求数据]
 * @param {Object} config [额外配置] 
 */
export const post = (url, data = {}, config = {}) => xhr({
  url,
  data: data || {},
  method: 'post',
  ...config,
}).catch((err) => {
  console.log(`${err.status || ''}：${err.statusText || ''} ${err.message || ''}`);
  return Promise.reject(err);
});

/** 
 * post方法，发送json时使用
 * @param {String} url [请求的url地址] 
 * @param {Object} data [请求数据]
 * @param {Object} config [额外配置] 
 */
export const jsonPost = (url, data = {}, config = {}) => {
  let data1 = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== '') {
      data1[key] = data[key];
    }
  })
  return xhr({
    url,
    data: data1,
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    transformRequest: val => JSON.stringify(val),
    ...config,
  }).catch((err) => {
    console.log(`${err.status || ''}：${err.statusText || ''} ${err.message || ''}`);
    return Promise.reject(err);
  })
};