import request from '@/utils/request'
import { encryptByDES } from '@/utils/DES.js'

export function login(data) {
  console.log(data)
  return request({
    url: 'login/api/v1/ubc/login',
    method: 'post',
    params: {
      postUsername: encryptByDES(data.username, ''),
      postPassword: encryptByDES(data.password, ''),
      captchaCode: data.code
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
