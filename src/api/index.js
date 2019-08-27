// import API_URL from '@/api/api-url.js'

const loginUrl = 'http://localhost:8087'

// 获取登录验证码图片url
function getCaptchaCode() {
  return loginUrl + '/api/v1/login/captchaCode' + '?' + Date.parse(new Date())
}

// // 获取统一模块列表
// function getModuleList() {
//   return API_URL.getModulelist
// }

// 登陆
function login() {
  return loginUrl + '/api/v1/ubc/login'
}

// // 获取手机验证码
// function phoneCode() {
//   return API_URL.phoneCode
// }

// // 身份验证
// function authen() {
//   return API_URL.authen
// }

// // 新密码确认
// function password() {
//   return API_URL.password
// }

// 获得key值  在登陆验证
function key() {
  return 'http://localhost:8087/api/v1/login/generate/param' + '?' + Date.parse(new Date())
}

// // 点击具体模块
// function signName() {
//   return API_URL.signName
// }

export { getCaptchaCode, login, key }

// const API_URL = {
//   'getCaptchaCode': loginUrl + '/api/v1/login/captchaCode', // 验证码
//   'getModulelist': loginUrl + '/api/v1/product/list', // 模块列表
//   'login': loginUrl + '/api/v1/ubc/login', // 登录
//   'phoneCode': loginUrl + '/api/v1/login/send/sms', // 获取手机验证码
//   'authen': loginUrl + '/api/v1/login/sms/confirm', // 身份验证
//   'password': loginUrl + '/api/v1/login/pwd/reset', // 新密码确认
//   'key': loginUrl + '/api/v1/login/generate/param', // key
//   'signName': loginUrl + '/api/v1/product/one', // 点击模块具体，
//   'check_token': loginUrl + '/api/v1/oauth/check_token' // 验证token，
//   // 'unified_platform_url' : "http://49.4.88.134:8381/",
// }
// export default API_URL
