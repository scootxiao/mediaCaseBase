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

/**
 * 获取登录用户信息
 */
export function getLoginUserInfo() {
  return request({
    url: '/media_repository/common/query/loginUserInfo'
  })
}

/**
 * 获取登录用户信息
 */
export function getVerifyCode(data) {
  return request({
    url: `/media_repository/common/query/getPhoneVerifyCode?phone=${data}&template=1`
  })
}

/**
 * 导出文章
 */
export function exportExcel(data) {
  return request({
    method: 'post',
    url: '/media_repository/mediaPerson/export',
    data,
    processData: false,
    responseType: 'blob'
  })
}

// 删除表格列
export function delRow(data) {
  return request({
    url: `/media_repository/mediaPerson/deleteByIds?ids=${data}`
  })
}
