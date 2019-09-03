import request from '@/utils/request'

export function getMedia(params) {
  return request({
    url: '/media_repository/media/findMTMedia',
    method: 'post',
    data: params
  })
}

// 获取表格数据
export function getMediaPersonList(data) {
  return request({
    url: '/media_repository/mediaPerson/selectPage',
    method: 'post',
    data: data
  })
}

