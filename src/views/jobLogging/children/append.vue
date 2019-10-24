<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6" ref="tree_warper" class="tree-warper">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane name="first" label="个人库">
            <div class="tree-bd">
              <el-input
                v-model.trim="filterText"
                maxlength="20"
                placeholder="输入关键字进行过滤"
              />
              <div class="tree-box">
                <el-tree
                  ref="personalMediaTree"
                  class="filter-tree"
                  :data="personalMediaTreeData"
                  :props="defaultProps"
                  node-key="nodeKey"
                  show-checkbox
                  :filter-node-method="filterNode"
                  @check-change="changeMediaPerson"
                  @check="personMediaCheck"
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
              <div class="tree-box" >
                <el-tree
                  ref="allMediaTree"
                  class="filter-tree"
                  :data="allMediaTreeData"
                  :props="defaultProps"
                  node-key="nodeKey"
                  show-checkbox
                  :filter-node-method="filterNode"
                  @check-change="changeMediaPerson"
                  @check="personMediaCheck"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="17">
        <el-form ref="form" :model="form" class="commonForm" label-width="140px">
          <el-form-item label="标　　题：" required>
            <el-input v-model.trim="form.title" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="相关媒体人：" required>
            <el-card class="box-card">
              <div class="media-warper clearfix">
                <div v-for="(item,index) of mediaList" :key="'key'+index" class="media-item">
                  <span class="name" :title="mediaPersonText(item)">{{ mediaPersonText(item) }}</span>
                  <el-button class="btn-close" type="text" icon="el-icon-close" @click="removeMediaPerson(item.id, index)" />
                </div>
              </div>
            </el-card>
          </el-form-item>
          <el-form-item label="记录时间：" required>
            <el-date-picker
              v-model="form.recordTime"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="date"
              :picker-options="pickerOptions"
              placeholder="选择日期"
              style="width:100%;"
            />
          </el-form-item>
          <el-form-item label="内　　容：" required>
            <el-input
              v-model="form.text"
              type="textarea"
              maxlength="10000"
              :rows="8"
              placeholder="请输入内容"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="附　　件：">
            <el-upload
              class="upload-demo"
              action="/media_repository/workRecord/uploadFiles"
              name="files"
              :accept="acceptFileTypes"
              :headers="headers"
              :data="{recordId: form.id || ''}"
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
              <el-button size="mini" type="default">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">请上传大小10M内的附件，最多上传5个附件</div>
            </el-upload>
          </el-form-item>
          <el-form-item v-if="form.id" label="已 发 送 ：">
            <el-card class="box-card">
              <div class="media-warper clearfix">
                <div v-for="(user,index) of sendedUsers" :key="'key'+index" class="media-item">
                  <span class="name" :title="user.to_user_name + ' (' + user.to_dept_name + ')'">
                    {{ user.to_user_name + ' (' + user.to_dept_name + ')' }}
                  </span>
                </div>
              </div>
            </el-card>
          </el-form-item>
          <el-form-item :label="form.id ? '再次发送：' : '发 送 至 ：'">
            <el-button size="mini" type="default" @click="showUserListDialog = true">添加</el-button>
            <el-card class="box-card" style="border: none;">
              <div class="media-warper clearfix">
                <div v-for="(item,index) of userList" :key="'key'+index" class="media-item">
                  <span class="name" :title="item.username + ' (' + item.parentNode.username + ')'">{{ item.username + ' (' + item.parentNode.username + ')' }}</span>
                  <el-button class="btn-close" type="text" icon="el-icon-close" @click="removeUser(index)" />
                </div>
              </div>
            </el-card>
          </el-form-item>
        </el-form>
        <div class="btn-line">
          <el-button type="primary" size="medium" :disabled="disableSave" @click="saveOrUpdate">保存</el-button>
          <el-button size="medium" @click="cancel">取消</el-button>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      title="添加接收人"
      :visible.sync="showUserListDialog"
      width="55%"
    >
      <dept-user-tree
        :tree-data="userTreeData"
        :selected-data="selectUserTreeList"
        @change="changeUserList"
      />
       <div slot="footer" class="dialog-footer">
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
import deptUserTree from '@/components/deptUserTree'
import MediaAPI from '@/api/mediaSettings'
import FileTypes from '@/config/filetypes'

import {
  getDeptUserList,
  getFormData,
  getReceieUsers,
  getRecordMediaPersons,
  getRecordFiles,
  deleteFiles,
  selectFileData,
  beforeRemoveFiles
} from '@/api/job'

import commonUtil from '@/config/common.js'

export default {
  name: 'jobLoggingAppend',
  filters: {
  },
  components: {deptUserTree},
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
        text: '',
        // recordTime: new Date().format('yyyy-MM-dd hh:mm:ss')
      },
      mediaList: [],
      originMediaList: [],
      userList: [],
      sendedUsers: [],
      selectUserTreeList: [],
      activeName: 'first',
      filterText: '',
      personalMediaTreeData: [],
      allMediaTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        disabled: (data, node) => {
          return data.nodeKey.indexOf('PERSON') == -1 && this.filterText
        }
      },
      pickerOptions: {
        disabledDate(date) {
          return new Date().getTime() < new Date(date).getTime()
        }
      },
      userTreeData: [],
      showUserListDialog: false,
      disableSave: false
    }
  },
  computed: {
    acceptFileTypes() {
      return this.FileTypes.all.map(item => '.' + item).join()
    }
  },
  watch: {
    filterText(val) {
      this.$refs.personalMediaTree.filter(val)
      this.$refs.allMediaTree.filter(val)
    },
    fileList(val) {
      this.$nextTick(() => {
        this.setFileListTitle()
      })
    }
  },
  created() {
    this.getRecord()
    this.getPersonalMediaTreeData()
    this.getAllMediaTreeData()
    this.getRecordMediaPersons()
    this.getUserTreeData()
  },
  methods: {
    setFileListTitle() {
      const files = document.querySelectorAll('.el-upload-list__item-name') || []
      try {
        files.forEach(f => {
          f.setAttribute('title', f.innerText)
        })
      } catch (e) {
        console.error(e)
      }
    },
    mediaPersonText(p) {
      return `${(p.mediaPersonName || p.name || '')} ( ${p.mediaName} ${MediaAPI.parseMediaType(p.typeId)})`
    },
    async getRecord() {
      if (this.$route.query.id) {
        let {code, msg, data} = await getFormData(this.$route.query.id);
        if (code === '0') {
          this.form = data
          this.getRecordFiles()
          this.getReceieUsers()
        } else {
          this.$message.error(msg)
        }
      }
    },
    async getReceieUsers() {
      let  {code, msg, data} = await getReceieUsers(this.form.id);
      if ( code == '0' ) {
        const users = []; 
        const ids = [];
        ( data || []).forEach(item => {
          if (ids.indexOf(item.to_user_id) == -1) {
            users.push(item)
          }
          ids.push(item.to_user_id)
        })
        this.sendedUsers = users
      }
    },
    async getRecordMediaPersons() {
      if (!this.$route.query.id) {
        return
      }
      let {code, msg, data} = await getRecordMediaPersons(this.$route.query.id);
      if (code === '0') {
        this.originMediaList = [data]
        const keys = []
        data.forEach(item => {
          keys.push('PERSON' + item.mediaPersonId)
        })
        this.$refs.personalMediaTree.setCheckedKeys(keys)
        this.$refs.allMediaTree.setCheckedKeys(keys)
      } else {
        this.$message.error(msg)
      }

    },
    async getRecordFiles() {
      if (!this.$route.query.id) {
        return
      }

      this.fileList = [];
      let {code, msg, data} = await getRecordFiles(this.$route.query.id);
      if (code == '0') {
        this.fileList = data.map(item => {
          item.name = item.fileName
          return item
        })
      } else {
        this.$message.error(msg)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleClick(tab, event) {
      // console.log(tab, event);
    },
    async handleRemove(file, fileList) {
      let {code, msg, data, statusText} = await deleteFiles(file.id, this.form.id);
      if(code === 0)
        this.$message({'type': 'info','message': msg})
      else
        this.$message({'type': 'error','message': statusText})
    },
    async handlePreview(file) {
      if ( this.FileTypes.img.indexOf(file.fileType) == -1 ) {
          commonUtil.downloadFile(`/media_repository/workRecord/downloadFiles?fileIds=${file.id}`);
          return;
      }
      this.showLoading("加载中，请稍候...");

      let {code, data, msg} = await selectFileData(encodeURIComponent(file.fileUrl));
      if (code === '0') {
        this.preview.show = true;
        this.preview.url = 'data:image/jpeg;base64,' + data
      } else {
        this.$message({type: "error",message: "获取附件信息失败：" + msg});
      }
      this.loading.close();
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    async beforeRemove(file, fileList) {
      if (!file.id) {
        return Promise.resolve('')
      }
      await this.$confirm(`您确定要移除 ${file.name}吗？`)

      let {code, msg, data} = await beforeRemoveFiles(file.id, this.form.id);
      if (code == '0') {
        return Promise.resolve('ok')
      }
      this.$message({type: 'error',message: msg})
      return Promise.reject(msg)
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
        this.$nextTick(() => {
          this.setFileListTitle()
        })
      } else {
        this.$message({
          type: 'error',
          message: response.msg
        })
      }
    },
    setChecked(tree, node, checked) {
      tree.setChecked(node, checked)
      if (node.children) {
        node.children.forEach(ch1 => {
          tree.setChecked(ch1, checked)
          if (ch1.children) {
            ch1.children.forEach(ch2 => {
              tree.setChecked(ch2, checked)
            })
          }
        })
      }
    },
    personMediaCheck(node, status) {
      const checked = status.checkedKeys.indexOf(node.nodeKey) != -1
      if (this.activeName == 'first') {
        this.setChecked(this.$refs.allMediaTree, node, checked)
      } else {
        this.setChecked(this.$refs.personalMediaTree, node, checked)
      }

      this.changeMediaPerson()
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
      this.mediaList = all
    },
    removeMediaPerson(key, index) {
      this.$refs.personalMediaTree.setChecked('PERSON' + key, false)
      this.$refs.allMediaTree.setChecked('PERSON' + key, false)
      this.mediaList.splice(index, 1)
    },
    cancel() {
      window.close()
    },
    async saveOrUpdate() {
      // await this.$confirm("您确定要保存修改吗？")
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
      this.showLoading('处理中，请稍侯...')
      let {code, msg, data} = await saveOrUpdate({
        workRecord: this.form,
        mediaPersons,
        receiveUsers: this.userList,
        fileIds: '',
        deleteWorkRecordMediaPersonId: deletePersonIds.join(',')
      });
      if (code == '0') {
        this.disableSave = true
        this.$message.success('保存成功')
        setTimeout(this.cancel, 3000)
      } else {
        this.$message.error(msg)
      }
      this.loading.close()
    },
    showLoading(tips) {
      this.loading = this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    async getPersonalMediaTreeData() {
      let {code, data} = await MediaAPI.getMediaPersonTree({});
      this.personalMediaTreeData = data;
    },
    async getAllMediaTreeData() {
      let {code, data} = await  MediaAPI.getMediaPersonTree({ type: 2 });
      this.allMediaTreeData = data;
    },
    async getUserTreeData() {
      let {code, msg, data} = await getDeptUserList();
      if (code == '0') {
        data.forEach(item => item.username = item.org_name)
        this.userTreeData = data
      } else {
        this.$message.error(msg)
      }
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

    .handle-box {
        padding-bottom: 0;
    }

    .tree-warper{
      border: solid 1px #ddd;
      border-radius: 5px;
    }

    .tree-warper >>> .el-tabs__nav-scroll{
      text-align: center;
      font-size: 0;
    }

    .tree-warper >>> .el-tabs__nav {
      display: inline-block;
      float: none;
    }

    .tree-bd {
        padding: 10px;
    }

    .tree-box{
      margin-top: 5px;
      overflow: auto;
    }

    .media-warper {
        min-height: 160px;
        max-height: 320px;
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
        border: 1px solid #ddd;
    }

    .box-card /deep/ .el-card__header {
        padding: 3px 10px;
    }

    .box-card /deep/ .el-card__body {
        padding: 3px 0 3px 10px;
    }

    .btn-line{
      margin-top:50px;
      margin-bottom:30px;
      padding: 20px 40px;
      text-align: center;
    }

    .btn-line >>> .el-button{
      margin: 0 50px;
    }

</style>
