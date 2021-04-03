
import moment from 'moment';

export function getImg(path) {
  if (path && path.startsWith('data:image')) {
    return path;
  }
  if (path && typeof path === 'string') {
    return require(`_/${path}`);
  }
  return '';
}

export function stringifyDateTime(dataStr, pattern = 'YYYY-MM-DD HH:mm') {
  return moment(dataStr).format(pattern)
}

export function flatten(obj){
  var result = {};

  function recurse(src, prop) {
      var toString = Object.prototype.toString;
      if (toString.call(src) == '[object Object]') {
          var isEmpty = true;
          for (var p in src) {
              isEmpty = false;
              recurse(src[p], prop ? prop + '.' + p : p)
          }
          if (isEmpty && prop) {
              result[prop] = {};
          }
      } else if (toString.call(src) == '[object Array]') {
          var len = src.length;
          if (len > 0) {
              src.forEach(function (item, index) {
                  recurse(item, prop ? prop + '.[' + index + ']' : index);
              })
          } else {
              result[prop] = [];
          }
      } else {
          result[prop] = src;
      }
  }
  recurse(obj,'');

  return result;
}

export function unflatten(data) {
  if (Object(data) !== data || Array.isArray(data))
      return data;
  var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
      resultholder = {};
  for (var p in data) {
      var cur = resultholder,
          prop = "",
          m;
      while (m = regex.exec(p)) {
          cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
          prop = m[2] || m[1];
      }
      cur[prop] = data[p];
  }
  return resultholder[""] || resultholder;
}

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}