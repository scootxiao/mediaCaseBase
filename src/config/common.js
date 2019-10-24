import request from '@/utils/request'
import { Message, Loading } from 'element-ui'

const common = {}
common.downloadFile = function(url, fun) {
  const loading = Loading.service({
    lock: true,
    text: '下载中，请稍候...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  request({
    method: 'get',
    url: url,
    processData: false,
    responseType: 'blob'
  }).then(response => {
    loading.close()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url

    let realFileName = response.headers['content-disposition'].split('filename=')[1]
    realFileName = decodeURIComponent(realFileName)

    link.setAttribute('download', realFileName)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    if (fun) {
      fun()
    }
  }).catch((error) => {
    loading.close()
    Message({
      type: 'error',
      message: '下载异常'
    })
    console.log(error)
  })
}

export default common
