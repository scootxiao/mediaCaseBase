import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 15000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['X-Token'] = getToken()
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    // console.log('config:', config)
    return config
  },
  error => {
    console.log('request拦截器出错')
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    // if (res.code !== 20000) {
    //   Message({
    //     message: res.message || 'Error',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })

    //   50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //     // to re-login
    //     MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
    //       confirmButtonText: 'Re-Login',
    //       cancelButtonText: 'Cancel',
    //       type: 'warning'
    //     }).then(() => {
    //       store.dispatch('user/resetToken').then(() => {
    //         location.reload()
    //       })
    //     })
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'))
    // } else {
    //   console.log('response err res:', res)
    //   return res
    // }

    if (res.code) {
      // console.log('response res:', res)
      return res
    } else {
      return response
    }
  },
  error => {
    // console.log('response拦截器出错')
    console.log('err' + error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    // return Promise.reject(error)

    if (error && error === 'Error: timeout of 5000ms exceeded') {
      console.log(`接口请求超时,请检查接口`)
      Message.error('接口请求超时,请检查接口')
      return Promise.reject(new Error(`接口请求超时,请检查接口`))
    }

    if (error && error.response) {
      if (error.response.status === 400) {
        Message.error('服务器异常-400')
        console.log(`【service response error】status: ${error.response.data.status}, message: ${error.response.data.message}`)
        return Promise.reject(new Error(error.response.data.message || 'Error'))
      }
      if (error.response.status === 404) {
        Message.error('服务器异常-404')
        console.log(`【service response error】status: ${error.response.data.status}, message: ${error.response.data.message}`)
        return Promise.reject(new Error(error.response.data.message || 'Error'))
      }
      if (error.response.status === 500) {
        Message.error(`服务器异常-500`)
        console.log('服务器异常-500')
        console.log('request service response error：' + error.response.data.toString()) // for debug
        return Promise.reject(new Error(error.response.data.message || 'Error'))
      }
    }

    const errorData = error.response.data
    console.log('error:', error.response.data, 'response 拦截器出错') // for debug
    if (undefined !== errorData.errorCode && (errorData.errorCode === '7' || errorData.errorCode === '8')) {
      window.sessionStorage.removeItem('access_token', '')
      router.push({ path: '/init' })
      Message.error(errorData.errorMessage)
      return Promise.reject(new Error(errorData.errorMessage || 'Error'))
    }

    Message.error(`服务器异常 - ${error}`)
    return Promise.reject(new Error(errorData.message || 'Error'))
  }
)

export default service
