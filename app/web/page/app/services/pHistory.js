import { get, post } from '.';

export async function getPageHistory(pageId) {
  return await get('/pHistory/list', { pageId });
}

export async function getPageHistoryDetail(pHistoryId) {
    return await get('/pHistory/detail', { pHistoryId });
}