import request from '@/utils/request'
import { encryptByDES } from '@/utils/DES.js'

import axios from 'axios'
axios.defaults.withCredentials = true

export function login(data) {
  console.log('----data:', data)
  return axios.post('http://localhost:8087/api/v1/ubc/login', {
    method: 'post',
    params: {
      postUsername: encryptByDES(data.username, data.key),
      postPassword: encryptByDES(data.password, data.key),
      captchaCode: data.code
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
