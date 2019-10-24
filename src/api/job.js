import request from '@/utils/request'

export function recordList(params) {
  return request({
    url: '/media_repository/workRecord/selectPage',
    method: 'post',
    data: params
  })
}

export function getDeptUserTree(sameOrg) {
  return request({
    url: `/media_repository/common/query/deptUserList?sameOrg=${sameOrg}`,
    method: 'get'
  })
}

// 批量发送
export function jobSendBatch(params) {
  return request({
    url: '/media_repository/workRecord/sendBatch',
    method: 'post',
    data: params
  })
}

// 批量删除
export function jobBatchDelete(ids) {
  return request({
    url: `/media_repository/workRecord/deleteRecordByIds?ids=${ids}`,
    method: 'get'
  })
}

// 我的接收 表格
export function receiveTableData(params) {
  return request({
    url: '/media_repository/workRecord/selectReceivePage',
    method: 'post',
    data: params
  })
}

// 我的接收 表格删除单列
export function receiveTableDelete(params) {
  return request({
    url: `/media_repository/workRecord/deleteReceiveByIds?ids=${params}`,
    method: 'get'
  })
}

// 添加记录 添加接收人 弹框
export function getDeptUserList() {
  return request({
    url: `/media_repository/common/query/deptUserList`,
    method: 'get'
  })
}

// 编辑 回显表单
export function getFormData(params) {
  return request({
    url: `/media_repository/workRecord/selectById/${params}`,
    method: 'get'
  })
}

// 编辑 回显已发送清单
export function getReceieUsers(params) {
  return request({
    url: `/media_repository/workRecord/selectReceiveByRecordId/${params}`,
    method: 'get'
  })
}

// 编辑 左边个人库信息
export function getRecordMediaPersons(params) {
  return request({
    url: `/media_repository/workRecord/selectMediaPersonsByRecordId/${params}`,
    method: 'get'
  })
}

// 回显附件
export function getRecordFiles(params) {
  return request({
    url: `/media_repository/workRecord/selectFilesByRecordId/${params}`,
    method: 'get'
  })
}

// 删除附件
export function deleteFiles(fileId, formId) {
  return request({
    url: '/media_repository/workRecord/deleteFiles?fileIds=' + fileId + '&recordId=' + formId,
    method: 'get'
  })
}

// 表单 上传图片预览
export function selectFileData(fileUrl) {
  return request({
    url: '/media_repository/workRecord/selectFileData?url=' + encodeURIComponent(fileUrl),
    method: 'get'
  })
}

// 表单 上传图片删除
export function beforeRemoveFiles(fileId, formId) {
  return request({
    url: `/media_repository/workRecord/deleteFiles?fileIds=${fileId}&recordId=${formId || -1}`,
    method: 'get'
  })
}

// 表单保存
export function saveOrUpdate(data) {
  return request({
    url: '/media_repository/workRecord/saveOrUpdate',
    method: 'post',
    data: data
  })
}

// 我的接收 接收详情
export function getRecordList(id, data) {
  return request({
    url: `/media_repository/workRecord/selectPageByReceiveId/${id}`,
    method: 'post',
    data: data
  })
}

// 我的接收 接收详情
export function deleteReceive(id, ids) {
  return request({
    url: `/media_repository/workRecord/deleteRecordUnderReceive?id=${id}&recordIds=${ids}`,
    method: 'get'
  })
}

// 工作记录 查看
export function getRecord(id) {
  return request({
    url: `/media_repository/workRecord/selectById/${id}`,
    method: 'get'
  })
}

// 工作记录 查看 相关媒体人
export function getMediaList(id) {
  return request({
    url: `/media_repository/workRecord/selectMediaPersonsByRecordId/${id}`,
    method: 'get'
  })
}

// 工作记录 查看 获取附件
export function getFilesByRecordId(id) {
  return request({
    url: `/media_repository/workRecord/selectFilesByRecordId/${id}`,
    method: 'get'
  })
}
// 工作记录 查看 已发送列表
export function getReceiveByRecordId(id) {
  return request({
    url: `/media_repository/workRecord/selectReceiveByRecordId/${id}`,
    method: 'get'
  })
}

