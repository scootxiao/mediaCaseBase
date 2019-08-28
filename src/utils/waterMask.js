const WaterMask = {}

WaterMask.remove = function(selector) {
  var divs = document.querySelector(selector + ' .mask_div_wrapper')
  if (divs) {
    var target = document.querySelector(selector)
    target.removeChild(divs)
  }
}

WaterMask.add = function(selector, text, settings) {
  if (!text || text.length < 1) {
    return
  }
  // 默认设置
  var defaultSettings = {
    x: 0, // 水印起始位置x轴坐标
    y: 0, // 水印起始位置Y轴坐标
    rows: 0, // 水印行数
    cols: 0, // 水印列数
    x_space: 0, // 水印x轴间隔
    y_space: 75, // 水印y轴间隔
    color: '#AAA', // 水印字体颜色
    alpha: 0.4, // 水印透明度
    fontsize: '25px', // 水印字体大小
    font: '微软雅黑', // 水印字体
    width: 25 * text.length + 2, // 水印宽度
    height: 75, // 水印高度
    angle: 30// 水印倾斜度数
  }
  // 采用配置项替换默认值，作用类似jquery.extend
  if (typeof settings === 'object') {
    const src = settings || {}
    for (const key in src) {
      if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) { continue } else if (src[key]) {
        defaultSettings[key] = src[key]
      }
    }
  }

  defaultSettings.target = selector ? document.querySelector(selector) : document.body
  defaultSettings.txt = text || 'test'
  if (!defaultSettings.target.style.position) {
    defaultSettings.target.style.position = 'relative'
  }

  var oTemp = document.createElement('div')
  oTemp.classList.add('mask_div_wrapper')
  oTemp.style.overflow = 'hidden'
  oTemp.style.position = 'absolute'
  oTemp.style.left = '0'
  oTemp.style.right = '0'
  oTemp.style.bottom = '0'
  oTemp.style.top = '0'
  oTemp.style.pointerEvents = 'none'

  // 获取页面最大宽度
  var page_width = Math.max(defaultSettings.target.scrollWidth, defaultSettings.target.clientWidth)
  var cutWidth = page_width * 0.0150
  var page_width = page_width - cutWidth
  // 获取页面最大高度
  var page_height = Math.max(defaultSettings.target.scrollHeight, defaultSettings.target.clientHeight)

  for (var i = 0, y = 0; y < page_height - defaultSettings.height - defaultSettings.y_space; i++) {
    y = defaultSettings.y + (defaultSettings.y_space + defaultSettings.height) * i
    for (var j = 0, x = 0; x < page_width - defaultSettings.width - defaultSettings.x_space; j++) {
      x = defaultSettings.x + (defaultSettings.width + defaultSettings.x_space) * j
      var mask_div = document.createElement('div')
      mask_div.id = 'mask_div' + i + j
      mask_div.className = 'mask_div'
      mask_div.appendChild(document.createTextNode(defaultSettings.txt))
      // 设置水印div倾斜显示
      mask_div.style.webkitTransform = 'rotate(-' + defaultSettings.angle + 'deg)'
      mask_div.style.MozTransform = 'rotate(-' + defaultSettings.angle + 'deg)'
      mask_div.style.msTransform = 'rotate(-' + defaultSettings.angle + 'deg)'
      mask_div.style.OTransform = 'rotate(-' + defaultSettings.angle + 'deg)'
      mask_div.style.transform = 'rotate(-' + defaultSettings.angle + 'deg)'
      mask_div.style.visibility = ''
      mask_div.style.position = 'absolute'
      mask_div.style.left = x + 'px'
      mask_div.style.top = y + 'px'
      mask_div.style.overflow = 'hidden'
      mask_div.style.zIndex = '9999'
      mask_div.style.pointerEvents = 'none'// pointer-events:none  让水印不遮挡页面的点击事件
      // mask_div.style.border="solid #eee 1px";
      mask_div.style.opacity = defaultSettings.alpha
      mask_div.style.fontSize = defaultSettings.fontsize
      mask_div.style.fontFamily = defaultSettings.font
      mask_div.style.color = defaultSettings.color
      mask_div.style.textAlign = 'center'
      mask_div.style.width = defaultSettings.width + 'px'
      mask_div.style.height = defaultSettings.height + 'px'
      mask_div.style.display = 'block'
      oTemp.appendChild(mask_div)
    }
  }
  WaterMask.remove(selector)
  defaultSettings.target.appendChild(oTemp)
}

export default WaterMask
