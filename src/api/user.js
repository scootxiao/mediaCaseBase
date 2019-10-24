import request from '@/utils/request'
import { encryptByDES } from '@/utils/DES.js'

import axios from 'axios'
axios.defaults.withCredentials = true

export function login(data) {
  return axios.post('http://localhost:8087/api/v1/ubc/login', {
    postUsername: encryptByDES(data.username, data.key),
    postPassword: encryptByDES(data.password, data.key),
    captchaCode: data.code
  }, {
    headers: {
      'Authorization': ''
    }
  })
}

// ubs 获取key
// export function getKey(data) {
//   return axios.get('http://localhost:8087/api/v1/login/generate/param' + '?' + Date.parse(new Date()), {
//     params: {},
//     headers: {
//       'Authorization': ''
//     }
//   })
// }

export function getInfo(token) {
  // return request({
  //   url: '/user/info',
  //   method: 'get',
  //   params: { token }
  // })
  console.log('getInfo:', token)
  return {
    roles: ['unify_admin'],
    name: '统一平台 Admin',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    introduction: 'I am a super administrator'
  }
}

export function logout() {
  // return request({
  //   url: '/user/logout',
  //   method: 'post'
  // })
  return {
    roles: ['unify_admin'],
    name: '统一平台 Admin'
  }
}
