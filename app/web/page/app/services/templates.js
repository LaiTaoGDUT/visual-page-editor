import { get, post } from '.';

export async function getTemplates() {
  return await get('/templates/list');
}


export async function getTempDetail(id) {
  return await get('/templates/detail', {
    templateId: id
  });
}

export async function createTemplate(tName, pageId) {
  return await post('/templates/create', {
    tName,
    pageId
  });
}