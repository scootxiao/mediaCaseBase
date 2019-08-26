import request from '@/utils/request'

export function userLogin(query) {
  return request({
    url: 'login/ubc/login',
    method: 'post',
    params: query
  })
}

