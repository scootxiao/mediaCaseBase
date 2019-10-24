/**
 * 文件类型定义
 * @author zhouwei
 * @date 2019/07/16
 */
const FileTypes = {
  img: ['bmp', 'gif', 'jpg', 'tiff', 'psd', 'png', 'swf', 'svg', 'jpeg'],
  audio: ['mp3', 'aac', 'wav', 'ape', 'flac'],
  video: ['mp4', 'flv', 'avi', 'mov', 'mkv', 'wmv'],
  doc: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx'],
  compress: ['rar', 'zip'],
  all: ['bmp', 'gif', 'jpg', 'tiff', 'psd', 'png', 'swf', 'svg', 'jpeg',
    'mp3', 'aac', 'wav', 'ape', 'flac',
    'mp4', 'flv', 'avi', 'mov', 'mkv', 'wmv',
    'doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx',
    'rar', 'zip'
  ]
}
export default FileTypes
