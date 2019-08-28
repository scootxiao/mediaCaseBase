import request from '@/utils/request'
export default {
  geAreaList(params) {
    return request({
      url: '/media_repository/common/query/areaList',
      method: 'post',
      data: params
    })
  },
  getForeignAreaList(params) {
    return request({
      url: '/media_repository/common/query/foreignAreaList',
      method: 'post',
      data: params
    })
  }
}
