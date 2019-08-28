<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 工作记录</el-breadcrumb-item>
        <el-breadcrumb-item>查看</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-form ref="form" :model="form" class="commonForm" label-width="100px">
        <el-form-item label="标题：">{{ form.title }}</el-form-item>
        <el-form-item label="相关媒体人：">
          <el-card class="box-card">
            <!-- <div slot="header" class="clearfix">
                            <span>媒体人列表</span>
                        </div>-->
            <div class="media-warper clearfix">
              <div v-for="(item,index) of mediaList" :key="'key'+index" class="media-item">
                <span class="name" :title="mediaPersonText(item)">{{ mediaPersonText(item) }}</span>
              </div>
            </div>
          </el-card>
        </el-form-item>
        <el-form-item label="记录时间：">{{ (form.createTime || '').substr(0, 10) }}</el-form-item>
        <el-form-item label="内容：">
          <el-input
            v-model="form.text"
            type="textarea"
            :rows="8"
            placeholder="请输入内容"
            disabled
          />
        </el-form-item>
        <el-form-item label="附件：">
          <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            multiple
            :disabled="true"
            :limit="3"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <!--<el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
          </el-upload>
          <!-- <div v-for="file in fileList">{{file.fileName}}</div>-->
        </el-form-item>
        <el-form-item label="已发送：">
          <el-card class="box-card">
            <!--<div slot="header" class="clearfix">
                            <span>接收人列表</span>
                        </div>-->
            <div class="media-warper clearfix">
              <div v-for="user in receiveUsers" class="list-item">
                {{ user.to_user_name + ' (' + user.to_dept_name + ')' }}
              </div>
            </div>
          </el-card>
        </el-form-item>
      </el-form>
    </div>
    <div class="common-btns">
      <el-button type="primary" @click="cancel">返回</el-button>
    </div>

    <el-dialog
      title=""
      :visible.sync="preview.show"
      width="30%"
    >
      <img :src="preview.url" style="max-width: 300px; max-height: 200px;">
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import MediaAPI from '@/api/mediaSettings.js'
import FileTypes from '@/config/filetypes'
import FileUtil from '@/util/file.js'
export default {
  name: 'MediaMsg',
  filters: {

  },
  data() {
    return {
      fileList: [],
      form: {
        title: '',
        time: '',
        text: ''
      },
      FileTypes,
      mediaList: [],
      receiveUsers: [],
      activeName: 'second',
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      preview: {
        show: false,
        url: ''
      }
    }
  },
  computed: {},
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.getRecord()
  },
  methods: {
    mediaPersonText(val) {
      return [MediaAPI.parseMediaType(val.mediaType), val.mediaName, val.mediaPersonName].join(' ')
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      if (this.FileTypes.img.indexOf(file.fileType) == -1) {
        this.downloadFiles(file.id)
        return
      }
      this.showLoading('加载中，请稍候...')
      axios.get('/media_repository/workRecord/selectFileData?url=' + encodeURIComponent(file.fileUrl)).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.preview.show = true
          this.preview.url = 'data:image/jpeg;base64,' + res.data.data
        } else {
          this.$message({
            type: 'error',
            message: '获取附件信息失败：' + res.data.msg
          })
        }
      }).catch(err => {
        this.loading.close()
        this.$message({
          'type': 'error',
          'message': '获取附件信息异常:' + err.response.statusText
        })
      })
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    downloadFiles(fileIds) {
      this.showLoading('下载中，请稍候...')
      axios.get('/media_repository/workRecord/downloadFiles', {
        params: {
          fileIds: fileIds
        },
        responseType: 'arraybuffer'
      }).then(res => {
        this.loading.close()
        FileUtil.downLoadFromResponse(res, () => {
          this.exportDialog.show = false
        }, text => {
          this.$message.error(JSON.parse(text).msg)
        })
      }).catch(err => {
        this.loading.close()
        this.$message.error('下载失败')
      })
    },
    getRecord() {
      if (this.$route.query.recordId) {
        axios.get(`/media_repository/workRecord/selectById/${this.$route.query.recordId}`).then(res => {
          if (res.data.code == '0') {
            this.form = res.data.data
            this.getRecordMediaPersons()
            this.getRecordFiles()
            this.getReceieUsers()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      } else {
        this.$message.error('ID不存在')
      }
    },
    cancel() {
      window.close()
    },
    getRecordMediaPersons() {
      axios.get(`/media_repository/workRecord/selectMediaPersonsByRecordId/${this.form.id}`).then(res => {
        if (res.data.code == '0') {
          this.mediaList = res.data.data
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    getRecordFiles() {
      axios.get(`/media_repository/workRecord/selectFilesByRecordId/${this.form.id}`).then(res => {
        if (res.data.code == '0') {
          this.fileList = res.data.data.map(item => {
            item.name = item.fileName
            return item
          })
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    getReceieUsers() {
      axios.get(`/media_repository/workRecord/selectReceiveByRecordId/${this.form.id}`).then(res => {
        if (res.data.code == '0') {
          this.receiveUsers = res.data.data
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    showLoading(tips) {
      this.loading = this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
  }
}
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .handle-box {
        padding-bottom: 0;
    }

    .tree-warper {
        position: absolute;
        top: 40px;
        bottom: 0px;
        left: 0;
        width: 200px;
        border-right: solid 1px #d2d8e4;
    }

    .tree-warper >>> .el-tabs__nav {
        margin-left: 35px;
    }

    .tree-bd {
        padding: 10px;
    }

    .media-warper {
        min-height: 180px;
        max-height: 240px;
        overflow: auto;
    }

    .media-item {
        margin: 5px 1%;
        padding: 0 20px 0 5px;
        width: 31.33%;
        border: solid 1px #eee;
        border-radius: 4px;
        float: left;
        position: relative;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .media-item .btn-close {
        position: absolute;
        top: 10px;
        right: 3px;
        padding: 0;
        color: #f00;
    }

    .box-card {
        width: 100%;
    }

    .box-card >>> .el-card__header {
        padding: 3px 10px;
    }

    .box-card >>> .el-card__body {
        padding: 3px 0 3px 10px;
    }

    /* 接收人样式 */
    .list-item {
        padding: 0 20px 0 15px;
        width: 100%;
        height: 32px;
        line-height: 31px;
        color: #666;
        border-bottom: solid 1px #d2d8e4;
        position: relative;
    }

    .list-item:nth-last-child(1) {
        border: none;
    }

    .list-item .btn {
        position: absolute;
        top: 5px;
        right: 5px;
        display: none;
    }

    .list-item:hover {
        background-color: #66b1ff;
        color: #fff;
    }

    .list-item:hover .btn {
        display: block;
        color: #fff;
    }

</style>
