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

// 表格查看某项
export function getDetail(data) {
  return request({
    url: `/media_repository/mediaPerson/selectById/${data}`
  })
}

// 获取媒体信息
export function getMediaInfo(data) {
  return request({
    url: `/media_repository/mediaPerson/selectMediaInfoByPersonId/${data}`
  })
}

// 获取位置信息
export function getPositionInfo(data) {
  return request({
    url: `/media_repository/mediaPerson/selectPositionInfoByMediaId/${data}`
  })
}

/**
 * 用户部门树
 */
export function getDeptUserTree(sameOrg) {
  return request({
    url: `/media_repository/common/query/deptUserList?sameOrg=${sameOrg}`,
    method: 'get'
  })
}
//   async getUserInfo() {
//   let res = await request.get("/media_repository/common/query/loginUserInfo");
//   let userInfo = {
//       user_name : res.data.username,
//       user_type : res.data.user_type,
//       id : res.data.id,
//       orgid : res.data.orgid,
//           org_name: res.data.org_name,
//           push_del: res.data.push_del,
//           push_update: res.data.push_update,
//           push_receive: res.data.push_receive,
//           push_del_start_time: res.data.push_del_start_time,
//           push_update_start_time: res.data.push_update_start_time,
//           push_receive_start_time: res.data.push_receive_start_time,
//   }
//   return userInfo;
// },

/**
 * 根据部门ID获取部门信息
 */
export function getUserDeptInfo(deptId) {
  return request({
    url: `/media_repository/common/query/deptInfo/${deptId}`
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

// 新建或保存
export function saveOrUpdate(data) {
  console.log('新建或保存 data:', data)
  return request({
    url: '/media_repository/mediaPerson/saveOrUpdate',
    method: 'post',
    data
  })
}
