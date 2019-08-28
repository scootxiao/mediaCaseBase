
import request from '@/util/request'

export function getMediaTree(params) {
  return request({
    url: '/media_repository/media/findMTMedia',
    method: 'post',
    data: params
  })
}
