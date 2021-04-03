import axios from 'axios';
import { message } from 'ant-design-vue';

function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
  {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
  return "";
}

const xhr = axios.create({
  baseURL: '/api',
  timeout: 60000,
  withCredentials: true,
})

xhr.interceptors.request.use(
  config => {
    config.headers.common['x-csrf-token'] = getCookie('csrfToken');
    return config;
  },
  error => {
    return Promise.error(error);
  },
);

xhr.interceptors.response.use(
  response => {
    const { status, data, msg } = response.data;
    if (status !== 200) {
      message.error(msg || data.msg);
      return Promise.reject(response.data);
    }
    return response.data;
  },
  error => {
    // 处理超时情况，没有response
    message.error("网络错误，请稍后重试！");
    return Promise.reject(error.response ? error.response.data : error);
  }, 
);

export default xhr;