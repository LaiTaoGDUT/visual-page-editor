import { get } from '.';

export async function getCompLists() {
  return await get('/components/list');
}

export async function pGetCompLists() {
  return await get('/components/pList');
}

export async function getCompDetail({ id }) {
  return await get('/components/detail', { id });
}