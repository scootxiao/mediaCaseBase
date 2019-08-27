// let loginUrl='http://192.168.3.138:8087'
// let loginUrl='http://192.168.3.213:8082'
const loginUrl = 'http://localhost:8087'
// let loginUrl='http://114.116.17.234:8080'
// let loginUrl='http://192.168.3.138:8087'
// let loginUrl='http://49.4.88.134:8380'
const API_URL = {
  'getCaptchaCode': loginUrl + '/api/v1/login/captchaCode', // 验证码
  'getModulelist': loginUrl + '/api/v1/product/list', // 模块列表
  'login': loginUrl + '/api/v1/ubc/login', // 登录
  'phoneCode': loginUrl + '/api/v1/login/send/sms', // 获取手机验证码
  'authen': loginUrl + '/api/v1/login/sms/confirm', // 身份验证
  'password': loginUrl + '/api/v1/login/pwd/reset', // 新密码确认
  'key': loginUrl + '/api/v1/login/generate/param', // key
  'signName': loginUrl + '/api/v1/product/one', // 点击模块具体，
  'check_token': loginUrl + '/api/v1/oauth/check_token' // 验证token，
  // 'unified_platform_url' : "http://49.4.88.134:8381/",
}
export default API_URL
