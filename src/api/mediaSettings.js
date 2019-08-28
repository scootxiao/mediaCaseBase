import request from '@/utils/request'

export function getMediaTree(params) {
  return request({
    url: '/media_repository/media/findMTMedia',
    method: 'post',
    data: params
  })
}

export function mediaPager(params) {
  return request({
    url: '/media_repository/media/findMediaPage',
    method: 'post',
    data: params
  })
}

export function mediaBlockPager(params) {
  return request({
    url: '/media_repository/media/findMMBlockPager',
    method: 'post',
    data: params
  })
}

export function findMedia(params) {
  return request({
    url: '/media_repository/media/findByMedia',
    method: 'post',
    data: params
  })
}

export function mediaPositionProvince(params) {
  return request({
    url: '/media_repository/media/findPositionList',
    method: 'post',
    data: params
  })
}

export function mediaPositionCity(params) {
  return request({
    url: '/media_repository/media/findPositionList',
    method: 'post',
    data: params
  })
}

export function addMedia(params) {
  return request({
    url: '/media_repository/media/addMedia',
    method: 'post',
    data: params
  })
}

export function updateMedia(params) {
  return request({
    url: '/media_repository/media/updateMedia',
    method: 'post',
    data: params
  })
}

export function delByMedia(params) {
  return request({
    url: '/media_repository/media/delByMedia',
    method: 'post',
    data: params
  })
}

export function delTreeMedia(params) {
  return request({
    url: '/media_repository/media/deleteMMBlockList',
    method: 'post',
    data: params
  })
}

export function addMediaBlock(params) {
  return request({
    url: '/media_repository/media/addMediaBlock',
    method: 'post',
    data: params
  })
}

export function updateMediaBlock(params) {
  return request({
    url: '/media_repository/media/updateMediaBlock',
    method: 'post',
    data: params
  })
}

export function findByMediaBlock(params) {
  return request({
    url: '/media_repository/media/findByMediaBlock',
    method: 'post',
    data: params
  })
}

export function delByMediaBlock(params) {
  return request({
    url: '/media_repository/media/deleteMediaBlock',
    method: 'post',
    data: params
  })
}

export function changeSort(id1, id2) {
  return request({
    url: `/media_repository/media/changeSort?id1=${id1}&id2=${id2}`,
    method: 'get'
  })
}

function getMediaTypes() {
  return [{
    name: '微博',
    value: '1'
  }, {
    name: '微信',
    value: '2'
  }, {
    name: '网客户端/APP',
    value: '3'
  }, {
    name: '电视',
    value: '4'
  }, {
    name: '报纸/杂志',
    value: '5'
  }, {
    name: '广播',
    value: '6'
  }, {
    name: '新媒体',
    value: '7'
  }, {
    name: '户外媒体',
    value: '8'
  }, {
    name: '其它',
    value: '9'
  }]
}
function getMediaStores() {
  return [{
    name: '中央媒体',
    value: '1'
  }, {
    name: '省市级媒体',
    value: '2'
  }, {
    name: '涉大鹏媒体',
    value: '3'
  }, {
    name: '商业媒体及其它',
    value: '4'
  }]
}

function parseMediaType(intVal) {
  let name = '其它'
  switch (intVal) {
    case 1 : name = '微博'; break
    case 2 : name = '微信'; break
    case 3 : name = '网客户端/APP'; break
    case 4 : name = '电视'; break
    case 5 : name = '报纸/杂志'; break
    case 6 : name = '广播'; break
    case 7 : name = '新媒体'; break
    case 8 : name = '户外媒体'; break
    case 9 : name = '其它'; break
  }
  return name
}

function parseMediaStore(intVal) {
  let name = '商业媒体及其他'
  switch (intVal) {
    case 1 : name = '中央党媒'; break
    case 2 : name = '省市级媒体'; break
    case 3 : name = '涉大鹏媒体'; break
    case 4 : name = '商业媒体及其他'; break
  }
  return name
}

function getMediaPersonTree(params) {
  return request({
    url: '/media_repository/common/query/mediaPersonList',
    method: 'post',
    data: params
  })
}

export default {
  parseMediaType,
  parseMediaStore,
  getMediaTypes,
  getMediaStores,
  getMediaTree,
  mediaPager,
  mediaBlockPager,
  findMedia,
  mediaPositionProvince,
  mediaPositionCity,
  addMedia,
  updateMedia,
  delByMedia,
  delTreeMedia,
  addMediaBlock,
  updateMediaBlock,
  findByMediaBlock,
  delByMediaBlock,
  getMediaPersonTree,
  changeSort
}
