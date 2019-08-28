import request from '@/util/request'

export function getList(params) {
  return request({
    url: '/case_dp/case/selectPage',
    method: 'post',
    data: params
  })
}
