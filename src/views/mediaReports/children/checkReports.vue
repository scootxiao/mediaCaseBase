<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体报告</el-breadcrumb-item>
        <el-breadcrumb-item>查看</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="article-title">{{ mediaReportDetail.title }}</div>
      <div class="article-option">
        <!-- <span>媒体类型：{{mediaPersonDetail.mediaType}}</span>
              <span>媒体：{{mediaPersonDetail.media}}</span>
              <span>版块：{{mediaPersonDetail.block}}</span>
              <span>媒体区域：{{mediaPersonDetail.mediaArea}}</span>
              <span>编辑：{{mediaPersonDetail.author}}</span> -->
        <span>发布时间：{{ mediaReportDetail.publishTime }}</span> <br>
        <span>媒体人：{{ mediaReportDetail.media_person }}</span>
      </div>
      <div class="article-content-warper">
        <div v-html="mediaReportDetail.content" />
      </div>
      <div class="link">
        链接：<a :href="mediaReportDetail.url" target="_blank">{{ mediaReportDetail.url }}</a>
      </div>
      <div class="img-warper" />
      <el-card v-if="fileList.length > 0" class="box-card">
        <div slot="header" class="clearfix">
          <span>附件({{ fileList.length }}个)</span>
        </div>
        <div class="accessory-warper clearfix">
          <div v-for="(item,index) of fileList" :key="'key'+index" class="accessory-item">
            <a href="javascript:;" class="name" @click="handlePreview(item)">{{ item.name }}</a>
          </div>
        </div>
      </el-card>
    </div>
    <el-dialog
      title=""
      :visible.sync="preview.show"
    >
      <img :src="preview.url" style="max-width: 600px; max-height: 400px;align-content: center;">
    </el-dialog>
    <div class="common-btns">
      <el-button>返回</el-button>
    </div>
  </div>
</template>

<script>
import 'static/css/mine.css'
import request from '@/util/request'
import MediaAPI from '@/api/mediaSettings'
import FileTypes from '@/config/filetypes'
export default {
  name: 'CheckReports',
  data() {
    return {
      FileTypes,
      mediaReportDetail: {},
      fileList: [],
      preview: {
        show: false,
        url: ''
      },
      loading: null
    }
  },
  computed: {
  },
  watch: {

  },
  created() {
    this.initMediaReport()
  },
  methods: {
    initMediaReport() {
      const id = this.$route.query.id
      request({
        'url': '/media_repository/mediaReport/getMediaReportById?id=' + id,
        method: 'get'
      }).then(res => {
        if (res.code == '0') {
          this.mediaReportDetail = res.data.meida_report
          const publishTime = this.mediaReportDetail.publishTime
          if (publishTime) {
            this.mediaReportDetail.publishTime = publishTime.substring(0, 10)
          }

          let media_person_str = ''
          res.data.media_person_list.forEach(media_person => {
            media_person_str += media_person.person_name + '(' + media_person.media_name + '、' + MediaAPI.parseMediaType(media_person.media_type) + ')  '
            /* nodeData.id = media_person.person_id;
                  nodeData.mediaName = media_person.media_name;
                  nodeData.name = media_person.person_name;
                  nodeData.typeName = MediaAPI.parseMediaType(media_person.media_type);
                  nodeData.typeId = media_person.media_type;
                  nodeData.nodeKey = "PERSON" + media_person.person_id;
                  this.defaultCheckKeys.push(nodeData.nodeKey); //设置树默认选中节点
                  this.mediaPersons.push(nodeData);*/
          })
          this.mediaReportDetail.media_person = media_person_str
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
    },
    getFiles() {
      if (!this.mediaReportDetail.fileIds) {
        this.fileList = []
      } else {
        request({
          url: '/media_repository/fileInfo/selectFiles?fileIds=' + this.mediaReportDetail.fileIds,
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
          'message': '获取附件信息异常:' + err.msg
        })
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

  *{
    box-sizing: border-box;
  }

  a{
    color: #2968c9;
  }

  .container{
    padding: 50px 150px 60px 150px;
  }

  .article-title{
    padding-top: 20px;
    padding-bottom: 20px;
    line-height: 42px;
    font-size: 24px;
    color: #333;
    text-align: center
  }

  .article-option{
    margin-bottom: 20px;
    padding: 10px;
    line-height: 32px;
    font-size: 0px;
    border: solid 1px #dddee1;
    background-color: #f1f2f3;
  }

  .article-option > span{
    margin-right: 80px;
    display: inline-block;
    vertical-align: middle;
    font-size: 14px;
    color: #888;
  }

  .article-content-warper{
    position: relative;
    margin-bottom: 20px;
  }

  .article-content-warper > div,
  .article-content-warper > div > p{
    margin-bottom: 20px;
    line-height: 32px;
    font-size: 16px;
    color: #141414;
    text-indent: 32px;
  }

  .link > a{
    line-height: 28px;
    font-size: 14px;
    color: #409EFF;
  }

  .box-card{
    margin-top: 20px;
    width: 100%;
  }

  .box-card >>> .el-card__header{
    padding: 3px 10px;
  }

  .box-card >>> .el-card__body{
    padding: 3px 0 3px 10px;
  }

  .accessory{
    min-height: 180px;
    max-height: 240px;
    overflow: auto;
  }

  .accessory-item{
    margin: 5px;
    height: 28px;
    line-height: 28px;
    font-size: 13px;
    color: #666;
  }

</style>
