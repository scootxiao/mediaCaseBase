export default {
  downLoadFromResponse(response, successCallBack, errCallBack) {
    try {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      const fileName = response.headers['content-disposition'].replace(/.*filename=(.*)/, '$1')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', decodeURI(fileName))
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      if (typeof successCallBack === 'function') {
        successCallBack()
      }
    } catch (e) {
      if (typeof errCallBack === 'function') {
        this.readAsText(response.data).then(text => {
          errCallBack(text)
        })
      }
    }
  },
  readAsText(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = event => {
        resolve(reader.result)
      }
      reader.readAsText(blob)
    })
  }
}
