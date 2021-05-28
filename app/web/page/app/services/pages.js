import { get, post } from '.';

export async function getPages() {
  return await get('/pages/list');
}

export async function getPageDetail(pageId) {
    return await get('/pages/detail', { pageId });
}

export async function createPage(pName) {
  return await post('/pages/create', { pName })
}

export async function deletePage(pageId) {
  return await post('/pages/delete', { pageId })
}

export async function savePage({ pageId, saveType, ...data }) {
  if (!saveType) {
    return await post('/pages/savePage', {
      pageId,
      saveType: 1,
      ...data
    })
  }
  return await post('/pages/savePage', {
    pageId,
    saveType,
    ...data
  })
}

export async function saveCompData(pageId, compData, styleData, shoot) {
  return await savePage ({ pageId, saveType: 2, compData, styleData, shoot})
}

export async function saveBaseInfo(pageId, pageName, pageDocName) {
  return await savePage ({ pageId, saveType: 3, pageName, pageDocName})
}

export async function checkPageNameRepeat(pageId, pageName) {
  return await post('/pages/checkPageNameRepeat', {
    pageId,
    pageName
  })
}

export async function getPageVersionList(pageId) {
  return await get('/pages/versionList', {
    pageId
  })
}

export async function createPageVersion(pageId, versionName, pDocName, pStyleData, pCompData) {
  return await post('/pages/createVersion', {
    pageId,
    versionName,
    pDocName,
    pStyleData,
    pCompData,
  })
}

export async function offVersion(pageId, pVersionId) {
  return await post('/pages/offVersion', {
    pageId,
    pVersionId
  })
}

export async function publishVersion(pageId, pVersionId) {
  return await post('/pages/publishVersion', {
    pageId,
    pVersionId
  })
}

export async function versionDetail(pVersionId) {
  return await get('/pages/versionDetail', {
    pVersionId
  })
}



