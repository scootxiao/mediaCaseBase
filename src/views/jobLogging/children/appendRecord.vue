<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 工作记录</el-breadcrumb-item>
        <el-breadcrumb-item>我的记录</el-breadcrumb-item>
        <el-breadcrumb-item>添加记录</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div ref="tree_warper" class="tree-warper">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane name="first" label="个人库">
            <div class="tree-bd">
              <el-input
                v-model.trim="filterText"
                maxlength="20"
                placeholder="输入关键字进行过滤"
              />
              <div class="tree-box" :style="treeBoxObj">
                <el-tree
                  ref="personalMediaTree"
                  class="filter-tree"
                  :data="personalMediaTreeData"

                  :props="defaultProps"
                  node-key="nodeKey"
                  show-checkbox
                  :filter-node-method="filterNode"
                  @check-change="changeMediaPerson"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second" label="全库">
            <div class="tree-bd">
              <el-input
                v-model.trim="filterText"
                maxlength="20"
                placeholder="输入关键字进行过滤"
              />
              <div class="tree-box" :style="treeBoxObj">
                <el-tree
                  ref="allMediaTree"
                  class="filter-tree"
                  :data="allMediaTreeData"

                  :props="defaultProps"
                  node-key="nodeKey"
                  show-checkbox
                  :filter-node-method="filterNode"
                  @check-change="changeMediaPerson"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <el-form ref="form" :model="form" class="commonForm" label-width="100px">
        <el-form-item label="标题：">
          <el-input v-model.trim="form.title" maxlength="50" style="width:calc(100% - 100px)" />
          <span style="color:#aaa; float: right;">{{ (form.title || '').length }}/50</span>
        </el-form-item>
        <el-form-item label="相关媒体人：">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>媒体人列表</span>
            </div>
            <div class="media-warper clearfix">
              <div v-for="(item,index) of mediaList" :key="'key'+index" class="media-item">
                <span class="name">{{ item | mediaPersonFT }}</span>
                <el-button class="btn-close" type="text" icon="el-icon-close" @click="removeMediaPerson(item.id, index)" />
              </div>
            </div>
          </el-card>
        </el-form-item>
        <el-form-item label="记录时间：">
          <el-date-picker
            v-model="form.createTime"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd 00:00:00"
            type="date"
            :picker-options="pickerOptions"
            placeholder="选择日期"
            style="width:100%;"
          />
        </el-form-item>
        <el-form-item label="内容：">
          <el-input
            v-model="form.text"
            type="textarea"
            maxlength="10000"
            :rows="8"
            placeholder="请输入内容"
          />
          <div style="color: #aaa; text-align: right">{{ (form.text || '').length }}/10000</div>
        </el-form-item>
        <el-form-item label="附件：">
          <el-upload
            class="upload-demo"
            action="/media_repository/workRecord/uploadFiles"
            name="files"
            :accept="acceptFileTypes"
            :headers="headers"
            :data="{recordId: form.id}"
            :on-preview="handlePreview"
            :before-remove="beforeRemove"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-change="handleChange"
            multiple
            :limit="5"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">请上传大小10M内的附件，最多上传5个附件</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="接收人：">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>接收人列表</span>
              <el-button
                style="margin:5px 5px 0 0;padding: 3px 0;float: right;"
                type="primary"
                icon="el-icon-plus"
                @click="showUserListDialog = true"
              >新增
              </el-button>
            </div>
            <div class="media-warper clearfix">
              <div v-for="(item,index) of userList" :key="'key'+index" class="media-item">
                <span class="name">{{ item.username }}</span>
                <el-button class="btn-close" type="text" icon="el-icon-close" @click="removeUser(index)" />
              </div>
            </div>
          </el-card>
        </el-form-item>
      </el-form>
    </div>
    <div class="common-btns">
      <el-button type="primary" @click="saveOrUpdate">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>

    <el-dialog
      title="添加接收人"
      :visible.sync="showUserListDialog"
      width="55%"
    >
      <dept-user-tree
        :tree-data="userTreeData"
        :selected-data="selectUserTreeList"
        :props="userDefaultProps"
        @change="changeUserList"
      />
      <div style="margin-top: 2em; text-align: center;">
        <el-button type="primary" @click="addUserList">确定</el-button>
        <el-button @click="showUserListDialog = false">取消</el-button>
      </div>
    </el-dialog>

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
import deptUserTree from '@/components/page/deptUserTree'
import MediaAPI from '@/api/mediaSettings'
import FileTypes from '@/config/filetypes'
export default {
  name: 'MediaMsg',
  components: { deptUserTree },
  filters: {
    mediaPersonFT(p) {
      return (p.mediaPersonName || p.name || '') + (p.mediaName ? ('(' + p.mediaName + ')') : '')
    }
  },
  data() {
    return {
      fileList: [],
      headers: {
        Authorization: 'Bearer ' + sessionStorage.access_token
      },
      preview: {
        show: false,
        url: ''
      },
      FileTypes,
      form: {
        title: '',
        text: ''
      },
      mediaList: [],
      originMediaList: [],
      userList: [],
      selectUserTreeList: [],
      activeName: 'first',
      filterText: '',
      personalMediaTreeData: [],
      allMediaTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      pickerOptions: {
        disabledDate(date) {
          return new Date().getTime() < new Date(date).getTime()
        }
      },
      userTreeData: [],
      userDefaultProps: {
        children: 'userList',
        label: 'username'
      },
      showUserListDialog: false,
      treeBoxObj: {
        height: '320px'
      }
    }
  },
  computed: {
    acceptFileTypes() {
      return this.FileTypes.all.map(item => '.' + item).join()
    }
  },
  watch: {
    filterText(val) {
      if (this.activeName == 'first') {
        this.$refs.personalMediaTree.filter(val)
      } else {
        this.$refs.allMediaTree.filter(val)
      }
    }
  },
  created() {
    this.getRecord()
    this.getPersonalMediaTreeData()
    this.getAllMediaTreeData()
    this.getRecordMediaPersons()
    this.getUserTreeData()
  },
  mounted() {
    this.treeBoxObj.height = this.$refs.tree_warper.scrollHeight - 120 + 'px'
  },
  methods: {
    getRecord() {
      if (this.$route.query.id) {
        axios.get(`/media_repository/workRecord/selectById/${this.$route.query.id}`).then(res => {
          if (res.data.code == '0') {
            this.form = res.data.data
            this.getRecordFiles()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      } else {
        this.form = {
          title: '',
          time: '',
          content: ''
        }
      }
    },
    getFiles() {

    },
    getRecordMediaPersons() {
      if (!this.$route.query.id) {
        return
      }
      axios.get(`/media_repository/workRecord/selectMediaPersonsByRecordId/${this.$route.query.id}`).then(res => {
        if (res.data.code == '0') {
          this.mediaList = res.data.data
          this.originMediaList = this.mediaList
          const keys = []
          res.data.data.forEach(item => {
            keys.push('PERSON' + item.mediaPersonId)
          })
          this.$refs.personalMediaTree.setCheckedKeys(keys)
          this.$refs.allMediaTree.setCheckedKeys(keys)
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    getRecordFiles() {
      if (!this.form.fileIds) {
        this.fileList = []
      } else {
        axios.get('/media_repository/workRecord/selectFiles?fileIds=' + this.form.fileIds).then(res => {
          if (res.data.code == '0') {
            this.fileList = res.data.data.map(item => {
              item.name = item.fileName
              return item
            })
          } else {
            this.$message({
              'type': 'error',
              'message': res.data.msg
            })
          }
        }).catch(err => {
          this.$message({
            'type': 'error',
            'message': err.response.statusText
          })
        })
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    handleRemove(file, fileList) {
      axios.get('/media_repository/workRecord/deleteFiles?fileIds=' + file.id + '&recordId=' + this.form.id).then(res => {
        this.$message({
          'type': 'info',
          'message': res.data.msg
        })
      }).catch(err => {
        this.$message({
          'type': 'error',
          'message': err.response.statusText
        })
      })
    },
    handlePreview(file) {
      if (this.FileTypes.img.indexOf(file.fileType) == -1) {
        this.$message({
          type: 'warning',
          message: '仅图片支持预览，其他附件请下载查看'
        })
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
      this.$message.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    async beforeRemove(file, fileList) {
      if (!file.id) {
        return Promise.resolve('')
      }
      await this.$confirm(`您确定要移除 ${file.name}吗？`)
      const res = await axios.get(`/media_repository/workRecord/deleteFiles?fileIds=${file.id}&recordId=${this.form.id || -1}`)
      if (res.data.code == '0') {
        return Promise.resolve('ok')
      }
      this.$message({
        type: 'error',
        message: res.data.msg
      })
      return Promise.reject(res.data.msg)
    },
    beforeUpload(file) {
      return new Promise((resolve, reject) => {
        const size = file.size / 1024 / 1024
        if (size > 10) {
          this.$message({
            type: 'warning',
            message: '超过限制，请压缩后上传'
          })
          reject('超过10M，不允许上传')
        } else {
          resolve('ok')
        }
      })
    },
    handleChange(file, fileList) {

    },
    handleSuccess(response, file, fileList) {
      if (response.code == '0') {
        const ids = (this.form.fileIds || '').split(',')
        response.data.forEach(item => {
          ids.push(item.id)
          const index = fileList.findIndex(f => file.name == f.name && file.size == f.size)
          Object.assign(fileList[index], item)
        })
        if (!this.form.id) {
          this.form.fileIds = ids.join()
        }
      } else {
        this.$message({
          type: 'error',
          message: response.msg
        })
      }
    },
    changeMediaPerson() {
      const personal = (this.$refs.personalMediaTree.getCheckedNodes(true) || []).filter(item => item.level == 3)
      const all = (this.$refs.allMediaTree.getCheckedNodes(true) || []).filter(item => item.level == 3)
      const allId = all.map(item => item.id)
      personal.forEach(item => {
        if (allId.indexOf(item.id) == -1) {
          all.push(item)
        }
      })
      /* let keys = [];
                all.forEach(item => {
                    keys.push(item.nodeKey);
                })
                this.$refs.personalMediaTree.setCheckedKeys(keys);
                this.$refs.allMediaTree.setCheckedKeys(keys);*/
      this.mediaList = all
    },
    removeMediaPerson(key, index) {
      this.$refs.personalMediaTree.setChecked('PERSON' + key, false)
      this.$refs.allMediaTree.setChecked('PERSON' + key, false)
      this.mediaList.splice(index, 1)
    },
    cancel() {
      this.$router.push({
        path: '/jobLogging'
      })
    },
    async saveOrUpdate() {
      await this.$confirm('您确定要保存修改吗？')
      this.showLoading('处理中，请稍侯...')
      const recordId = this.$route.query.id
      const mediaPersons = []
      const deletePersonIds = []
      this.mediaList.forEach(item => {
        const index = this.originMediaList.findIndex(origin => origin.id == item.id)
        if (index == -1) {
          mediaPersons.push({
            recordId,
            mediaPersonId: item.id,
            mediaId: item.mediaId
          })
        }
      })
      this.originMediaList.forEach(item => {
        const index = this.mediaList.findIndex(now => now.id == item.id)
        if (index == -1) {
          deletePersonIds.push(item.id)
        }
      })
      /* if (!recordId && mediaPersons.length < 1) {
                    this.$message.warning("请选择相关媒体人");
                    return;
                }*/
      const data = {
        workRecord: this.form,
        mediaPersons,
        receiveUsers: this.userList,
        fileIds: '',
        deleteWorkRecordMediaPersonId: deletePersonIds.join(',')
      }
      axios.post('/media_repository/workRecord/saveOrUpdate', data).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.$message.success('保存成功')
          setTimeout(this.cancel, 3000)
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
        this.loading.close()
      })
    },
    showLoading(tips) {
      this.loading = this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    getPersonalMediaTreeData() {
      MediaAPI.getMediaPersonTree({}).then(res => {
        this.personalMediaTreeData = res.data
      })
    },
    getAllMediaTreeData() {
      MediaAPI.getMediaPersonTree({ type: 2 }).then(res => {
        this.allMediaTreeData = res.data
      })
    },
    getUserTreeData() {
      axios.get('/media_repository/common/query/deptUserList').then(res => {
        if (res.data.code == '0') {
          const data = res.data.data
          data.forEach(item => item.username = item.org_name)
          this.userTreeData = data
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    changeUserList(data) {
      this.selectUserTreeList = data
    },
    addUserList() {
      this.showUserListDialog = false
      this.userList = this.selectUserTreeList
    },
    removeUser(index) {
      this.userList.splice(index, 1)
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

    .container {
        padding-left: 200px;
    }

    .content-box .content .common-btns {
        left: 200px;
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

    .tree-box{
      margin-top: 5px;
      overflow: auto;
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

    .box-card /deep/ .el-card__header {
        padding: 3px 10px;
    }

    .box-card /deep/ .el-card__body {
        padding: 3px 0 3px 10px;
    }

</style>
