<template>
   <div class="app-container">
     <el-row>
      <el-col :offset="4" :span="16">
        <el-form ref="form" :model="form" label-width="100px">
          <el-form-item label="标　　题：">
            <el-input v-model.trim="form.title" maxlength="50" show-word-limit disabled />
          </el-form-item>
          <el-form-item label="相关媒体人：">
            <el-card class="box-card">
              <div class="media-warper clearfix">
                <div v-for="(item,index) of mediaList" :key="'key'+index" class="media-item">
                  <span class="name" :title="mediaPersonText(item)">{{ mediaPersonText(item) }}</span>
                </div>
              </div>
            </el-card>
          </el-form-item>
          <el-form-item label="记录时间：">
            <el-date-picker
              v-model="form.createTime"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="date"
              :picker-options="pickerOptions"
              placeholder="选择日期"
              style="width:100%;"
              disabled
            />
          </el-form-item>
          <el-form-item label="内　　容：">
            <el-input
              v-model="form.text"
              type="textarea"
              :rows="8"
              placeholder="请输入内容"
              disabled
            />
          </el-form-item>
          <el-form-item label="附　　件：">
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
          <el-form-item label="已 发 送 ：">
            <el-card class="box-card">
              <div class="media-warper clearfix">
                <div v-for="(user, index) of receiveUsers" :key="'key'+index" class="media-item">
                  <span class="name"> {{ user.to_user_name + ' (' + user.to_dept_name + ')' }}</span>
                </div>
              </div>
            </el-card>
          </el-form-item>
        </el-form>
      </el-col>
     </el-row>

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
// import FileUtil from '@/util/file.js'
import {
  getRecord,
  getMediaList,
  getFilesByRecordId,
  getReceiveByRecordId
} from '@/api/job'

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
      pickerOptions: {
        disabledDate(date) {
          return new Date().getTime() < new Date(date).getTime()
        }
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
  async created() {
    await this.getRecord();
    this.getRecordMediaPersons();
    this.getRecordFiles();
    this.getReceieUsers();
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
        // FileUtil.downLoadFromResponse(res, () => {
        //   this.exportDialog.show = false
        // }, text => {
        //   this.$message.error(JSON.parse(text).msg)
        // })
      }).catch(err => {
        this.loading.close()
        this.$message.error('下载失败')
      })
    },
    async getRecord() {
      if (this.$route.query.recordId) {
        let {code, msg, data} = await getRecord(this.$route.query.recordId);
        if (code === '0') {
          this.form = data
        } else {
          this.$message.error(msg)
        }
      } else {
        this.$message.error('ID不存在')
      }
    },
    cancel() {
      window.close()
    },
    async getRecordMediaPersons() {
      let {code, msg, data} = await getMediaList(this.form.id);
      if (code === '0') {
        this.mediaList = data
      } else {
        this.$message.error(msg)
      }
    },
    async getRecordFiles() {
      let {code, data, msg} = await getFilesByRecordId(this.form.id);
      if( code === '0') {
        this.fileList = data.map(item => {
          item.name = item.fileName
          return item
        })
      }else {
        this.$message.error(msg)
      }
    },
    async getReceieUsers() {
       let {code, data, msg} = await getReceiveByRecordId(this.form.id);
        if (code == '0'){
          const [users,ids] = [[], []];
          (data || []).forEach(item => {
            if (ids.indexOf(item.to_user_id) == -1) {
              users.push(item)
            }
            ids.push(item.to_user_id)
          })
          this.receiveUsers = users
        }else{
          this.$message.error(res.data.msg)
        }

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

    .box-card {
        width: 100%;
    }

    .box-card >>> .el-card__body{
      padding: 3px 0 3px 10px;
      background-color: #F5F7FA;
      border:slid 1px #dfe4ed;
    }

    .media-warper {
      min-height: 180px;
      max-height: 240px;
      overflow: auto;
    }

    .media-item {
      margin: 5px 1%;
      padding: 0 20px 0 8px;
      width: 31.33%;
      height: 28px;
      line-height: 28px;
      border: solid 1px #eee;
      border-radius: 4px;
      float: left;
      position: relative;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .media-item span{
      font-size: 14px;
      color: #C0C4CC;
    }

</style>
