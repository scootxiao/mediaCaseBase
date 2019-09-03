<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体报告</el-breadcrumb-item>
        <el-breadcrumb-item>新建</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-form ref="form" :model="formData" class="commonForm" label-width="100px">
        <el-form-item label="标题：" required>
          <el-input v-model="formData.title" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="媒体人：">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>媒体人列表</span>
              <el-button style="margin:5px 5px 0 0;padding: 3px 0;float: right;" type="primary" icon="el-icon-plus" @click="openMediaPersonSelect()">选择</el-button>
            </div>
            <div class="media-warper clearfix">
              <div v-for="(item,index) of mediaPersons" :key="'key'+index" class="media-item">
                <span class="name">{{ item.name }}（{{ item.mediaName }}、{{ item.typeName }}）</span>
                <el-button class="btn-close" type="text" icon="el-icon-close" @click="removeCheckedPM(item.nodeKey)" />
              </div>
            </div>
          </el-card>
        </el-form-item>
        <el-form-item label="发布时间：" required>
          <el-date-picker
            v-model="formData.publishTime"
            value-format="yyyy-MM-dd 00:00:00"
            type="date"
            :editable="false"
            placeholder="选择日期"
            style="width:100%;"
          />
        </el-form-item>
        <el-form-item label="链接：">
          <el-input v-model="formData.url" placeholder="请输入链接" maxlength="500" />
        </el-form-item>
        <el-form-item label="内容：">
          <!--  <el-input
                  type="textarea"
                  :rows="8"
                  placeholder="请输入内容"
                  v-model="formData.content">
                </el-input> -->
          <quill-editor
            ref="myQuillEditor"
            v-model="formData.content"
            :options="editorOption"
          >
            <!-- @blur="onEditorBlur($event)" @focus="onEditorFocus($event)"
                    @change="onEditorChange($event)" -->
          </quill-editor>
        </el-form-item>
        <el-form-item label="附件：">
          <el-upload
            class="upload-demo"
            action="/media_repository/fileInfo/uploadFiles"
            name="files"
            :accept="acceptFileTypes"
            :headers="headers"
            :on-preview="handlePreview"
            :before-remove="beforeRemove"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-change="handleChange"
            multiple
            :limit="10"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">附件单个不超过500MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <div class="common-btns">
      <el-button type="primary" @click="editMediaReport">保存</el-button>
      <el-button>取消</el-button>
    </div>

    <el-dialog
      title="媒体人选择"
      :visible.sync="mediaDialog.show"
      width="50%"
    >
      <div class="dialog-box">
        <div class="tree-warper" style="width:49%;">
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"
          />
          <div class="tree-box">
            <el-tree
              ref="personalMediaTree"
              class="filter-tree"
              :data="personalMediaTreeData"
              :props="defaultProps"
              node-key="nodeKey"
              default-expand-all
              show-checkbox
              :filter-node-method="filterNode"
              :default-checked-keys="defaultCheckKeys"
              @check="checkPersonMedia"
            />
          </div>
        </div>
        <div class="list-warper" style="margin-left:2%;width:49%;">
          <div v-for="(item,index) of mediaPersons" :key="'key'+index" class="list-item">
            <span class="name">{{ item.name }}</span>
            <el-button class="btn" type="text" icon="el-icon-close" @click="removeCheckedPM(item.nodeKey)" />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="mediaDialog.show = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title=""
      :visible.sync="preview.show"
      width="30%"
    >
      <img :src="preview.url" style="max-width: 600px; max-height: 500px;">
    </el-dialog>
  </div>
</template>

<script>
import request from '@/util/request'
import axios from 'axios'
import 'static/css/mine.css'
import FileTypes from '@/config/filetypes'
import MediaAPI from '@/api/mediaSettings'
export default {
  name: 'MediaReports',
  data() {
    return {
      fileList: [/* {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}, {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}*/],
      FileTypes,
      formData: {
        title: '',
        publishTime: '',
        content: '',
        url: '',
        fileIds: '',
        id: this.$route.query.id
      },
      preview: {
        show: false,
        url: ''
      },
      headers: {
        Authorization: 'Bearer ' + sessionStorage.access_token
      },
      mediaDialog: {
        show: false
      },
      mediaPersons: [],
      personalMediaTreeData: [],
      defaultCheckKeys: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      filterText: '',
      loading: null,
      editorOption: {
        theme: 'snow'
        /* modules:{
                toolbar:[
                  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                  ['blockquote', 'code-block']
                ]
            }*/
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
      this.$refs.personalMediaTree.filter(val)
    }
  },
  created() {
    this.getPersonalMediaTreeData()
  },
  mounted() {
    this.initMediaReport()
  },
  methods: {
    initMediaReport() {
      if (this.formData.id) {
        request({
          'url': '/media_repository/mediaReport/getMediaReportById?id=' + this.formData.id,
          method: 'get'
        }).then(res => {
          if (res.code == '0') {
            this.formData = res.data.meida_report

            res.data.media_person_list.forEach(media_person => {
              const nodeData = {}
              nodeData.id = media_person.person_id
              nodeData.mediaName = media_person.media_name
              nodeData.name = media_person.person_name
              nodeData.typeName = MediaAPI.parseMediaType(media_person.media_type)
              nodeData.typeId = media_person.media_type
              nodeData.nodeKey = 'PERSON' + media_person.person_id
              this.defaultCheckKeys.push(nodeData.nodeKey) // 设置树默认选中节点
              this.mediaPersons.push(nodeData)
            })

            // 附件
            this.getFiles()
          } else {
            this.$message({
              'type': 'error',
              'message': res.msg
            })
          }
        }).catch(err => {
          this.$message({
            'type': 'error',
            'message': err.msg
          })
        })
      }/* else {
              this.formData = {
                  id: "",
                  url: "",
                  title:"",
                  publishTime: "",
                  emotion:"",
                  author:"",
                  domainId: null,
                  domainName:"",
                  text:"",
                  mediaType: ''
              };
          }*/
    },
    editMediaReport() {
      const mediaPersonIds = []
      this.mediaPersons.forEach(item => {
        mediaPersonIds.push(item.id)
      })

      if (mediaPersonIds.length == 0) {
        this.$message({
          type: 'error',
          message: '请选择媒体人'
        })
        return
      }

      if (!this.formData.fileIds && !this.formData.content) {
        this.$message({
          type: 'error',
          message: '内容和附件必须补充一项'
        })
        return
      }

      this.showLoading('保存中，请稍候...')

      const dto = {
        mediaReport: this.formData,
        mediaPersonIds: mediaPersonIds
      }

      request({
        url: '/media_repository/mediaReport/saveOrUpdateMediaReport',
        method: 'post',
        data: dto
      }).then(res => {
        this.loading.close()
        if (res.code == '0') {
          this.$message({
            type: 'success',
            message: '保存成功'
          })
          setTimeout(() => {
            /* window.opener = null;
                    window.open("about:blank", "_top").close()*/
            this.cancel
          }, 3000)
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      }).catch(err => {
        this.loading.close()
        this.$message({
          'type': 'error',
          'message': err.msg
        })
      })
    },
    getPersonalMediaTreeData() {
      MediaAPI.getMediaPersonTree({}).then(res => {
        this.personalMediaTreeData = res.data
      })
    },
    getFiles() {
      if (!this.formData.fileIds) {
        this.fileList = []
      } else {
        request({
          url: '/media_repository/fileInfo/selectFiles?fileIds=' + this.formData.fileIds,
          method: 'get'
        }).then(res => {
          if (res.code == '0') {
            this.fileList = res.data.map(item => {
              item.name = item.fileName
              return item
            })
          } else {
            this.$message({
              'type': 'error',
              'message': res.msg
            })
          }
        }).catch(err => {
          this.$message({
            'type': 'error',
            'message': err.msg
          })
        })
      }
    },
    openMediaPersonSelect() {
      this.mediaDialog.show = true
    },
    checkPersonMedia(currNode) {
      const checkPersonMediaNodes = []
      const checkedNodes = this.$refs.personalMediaTree.getCheckedNodes()
      checkedNodes.forEach(node => {
        if (node.typeId != null) {
          const nodeData = {}
          nodeData.id = node.id
          nodeData.mediaName = node.mediaName
          nodeData.mediaId = node.mediaName
          nodeData.name = node.name
          nodeData.typeName = node.typeName
          nodeData.typeId = node.typeId
          nodeData.nodeKey = node.nodeKey
          checkPersonMediaNodes.push(nodeData)
        }
      })
      this.mediaPersons = checkPersonMediaNodes
    },
    removeCheckedPM(nodeKey) {
      this.$refs.personalMediaTree.setChecked(nodeKey, false)
      this.checkPersonMedia()
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleRemove(file, fileList) {
      request({
        url: '/media_repository/fileInfo/deleteFiles?fileIds=' + file.id,
        method: 'get'
      }).then(res => {
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
      request({
        url: '/media_repository/fileInfo/selectFileData?url=' + encodeURIComponent(file.fileUrl),
        method: 'get'
      }).then(res => {
        this.loading.close()
        if (res.code == '0') {
          this.preview.show = true
          this.preview.url = 'data:image/jpeg;base64,' + res.data
        } else {
          this.$message({
            type: 'error',
            message: '获取附件信息失败：' + res.msg
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
      this.$message.warning(`当前限制选择 10 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    async beforeRemove(file, fileList) {
      if (!file.id) {
        return Promise.resolve('')
      }
      await this.$confirm(`您确定要移除 ${file.name}吗？`)
      const res = await request({
        url: `/media_repository/fileInfo/deleteFiles?fileIds=${file.id}`,
        method: 'get'
      })
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
        if (size > 100) {
          this.$message({
            type: 'warning',
            message: '超过限制，请压缩后上传'
          })
          reject('超过100M，不允许上传')
        } else {
          resolve('ok')
        }
      })
    },
    handleChange(file, fileList) {

    },
    handleSuccess(response, file, fileList) {
      if (response.code == '0') {
        let ids = []
        if (this.formData.fileIds) {
          ids = this.formData.fileIds.split(',')
        }
        response.data.forEach(item => {
          ids.push(item.id)
          const index = fileList.findIndex(f => file.name == f.name && file.size == f.size)
          Object.assign(fileList[index], item)
        })
        if (!this.formData.id) {
          this.formData.fileIds = ids.join(',')
        }
      } else {
        this.$message({
          type: 'error',
          message: response.msg
        })
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
  *{
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

  .handle-box{
    padding-bottom: 0;
  }

  .media-warper{
    min-height: 180px;
    max-height: 240px;
    overflow: auto;
  }

  .media-item{
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

  .media-item .btn-close{
    position: absolute;
    top: 10px;
    right: 3px;
    padding: 0;
    color: #f00;
  }

  .box-card{
    width: 100%;
  }

  .box-card >>> .el-card__header{
    padding: 3px 10px;
  }

  .box-card >>> .el-card__body{
    padding: 3px 0 3px 10px;
  }

  .dialog-box{
    display: flex;
  }

  .tree-warper{
    padding:10px;
    border:solid 1px #d2d8e4;
    border-radius: 5px;
  }

  .tree-box{
    margin-top: 10px;
    height: 240px;
    overflow: auto;
  }

  .list-warper{
    padding:10px;
    border:solid 1px #d2d8e4;
    border-radius: 5px;
  }

  .list-item{
    padding: 0 20px 0 15px;
    width: 100%;
    height: 32px;
    line-height: 31px;
    color: #666;
    border-bottom: solid 1px #d2d8e4;
    position: relative;
  }

  .list-item:nth-last-child(1){
    border: none;
  }

  .list-item .btn{
    position: absolute;
    top: 5px;
    right: 5px;
    display: none;
  }

  .list-item:hover{
    background-color: #66b1ff;
    color: #fff;
  }

  .list-item:hover .btn{
    display: block;
    color: #fff;
  }

</style>
