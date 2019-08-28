<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体报告</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handler-warper">
        <el-button type="primary" @click="toAddOrUpdatMediaReport(null)">添加</el-button>
        <el-button v-show="management_authority" type="primary" plain @click="exportMediaReport">导出</el-button>
        <el-button v-show="management_authority" type="primary" plain @click="batchDeleteArticle">删除</el-button>
      </div>
      <div class="handle-box">
        <el-form :inline="true" :model="formData">
          <!-- <el-select v-model="formData.classfy1">
                      <el-option label="按照标题" value="1"></el-option>
                      <el-option label="按照日期" value="2"></el-option>
                  </el-select> -->
          <el-form-item label="标题：">
            <el-input v-model="formData.title" class="handle-input mr10" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="媒体人：">
            <el-input v-model="formData.person_name" class="handle-input mr10" placeholder="请输入媒体人名称" />
          </el-form-item>
          <el-form-item label="媒体层级：">
            <el-select v-model="formData.media_storey">
              <el-option v-for="m in storeyOptions" :key="m.id" :label="m.name" :value="m.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="媒体：">
            <el-select v-model="formData.media_type" @change="getMediaOptions">
              <el-option label="全部类型" value="" />
              <el-option v-for="m in mediaTypeOptions" :key="m.value" :label="m.name" :value="m.value" />
            </el-select>
            <el-select v-model="formData.media_id">
              <el-option label="全部媒体" value="" />
              <el-option v-for="m in mediaOptions" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
          </el-input>
          <el-form-item label="发布时间：">
            <el-date-picker
              v-model="formData.publish_time"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              type="daterange"
              unlink-panels
              :editable="false"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>

          <el-button type="primary" class="handle-search" icon="search" @click="doSearch"><i class="iconfont icon-chazhao" /></el-button>
        </el-form>
      </div>
      <div class="table-content">
        <el-table ref="singleTable" border :span-method="mergeSpanMethod" :data="tableData" style="width: 100%" @selection-change="tableSelectChange">
          <el-table-column type="selection" align="center" width="50" fixed />
          <el-table-column property="title" align="left" label="标题" show-overflow-tooltip>
            <template slot-scope="scope">
              <a href="javascript:;" @click="toMediaReportView(scope.row.id)">{{ scope.row.title }}</a>
            </template>
          </el-table-column>
          <el-table-column property="storey_str" align="center" width="120px" label="媒体层级" show-overflow-tooltip />
          <el-table-column property="media_type_str" align="center" width="120px" label="媒体类型" show-overflow-tooltip />
          <el-table-column property="media_name" align="center" label="媒体" width="120px" show-overflow-tooltip />
          <el-table-column property="person_name" align="center" label="媒体人" width="120px" show-overflow-tooltip />
          <el-table-column property="publish_time" align="center" label="发布时间" width="140px" show-overflow-tooltip />
          <el-table-column property="created_at" align="center" label="添加时间" width="160px" show-overflow-tooltip />
          <el-table-column property="creater_name" align="center" label="操作人员" width="100px" show-overflow-tooltip />
          <el-table-column v-if="management_authority" label="操作" align="center" width="80px">
            <template slot-scope="scope">
              <el-button size="small" @click="toAddOrUpdatMediaReport(scope.row.id)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="common-btns">
      <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        layout="total, prev, pager, next,jumper"
        :total="pagination.total"
        @size-change="paginationSizeChange"
        @current-change="paginationCurrentChange"
      />
    </div>

  </div>
</template>

<script>
import 'static/css/mine.css'
// import axios from 'axios'
import axios from '@/util/request'
import MediaAPI from '@/api/mediaSettings'
export default {
  name: 'MediaReports',
  data() {
    return {
      formData: {
        media_storey: '',
        title: '',
        publish_time: ''
      },
      storeyOptions: [
        { id: 0, name: '全部', value: '' },
        { id: 1, name: '中央媒体', value: '1' },
        { id: 2, name: '省市级媒体', value: '2' },
        { id: 3, name: '涉大鹏媒体', value: '3' },
        { id: 4, name: '商业媒体及其他', value: '4' }
      ],
      batchSendDialog: {
        show: false
      },
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      tableData: [],
      mediaTypeOptions: MediaAPI.getMediaTypes(),
      mediaOptions: [],
      loading: null,
      spanArr: [],
      tableSelectRowIds: [],
      management_authority: false // 管理权限控制

    }
  },
  computed: {
  },
  watch: {
  },
  created() {
    this.getMediaOptions()
    this.loadMediaReportListData()

    let userInfo = window.sessionStorage.getItem('user_info')
    userInfo = JSON.parse(userInfo)
    if (userInfo.user_type == 2 || userInfo.user_type == 3) { // 系统管理员 部门管理员
      this.management_authority = true
    }
  },
  methods: {
    tableSelectChange(selection) {
      this.tableSelectRowIds = []
      selection.forEach(node => {
        if (this.tableSelectRowIds.indexOf(node.id) == -1) {
          this.tableSelectRowIds.push(node.id)
        }
      })
    },
    paginationSizeChange(value) {

    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.loadMediaReportListData()
    },
    loadMediaReportListData() {
      this.tableSelectRowIds = []
      const params = this.getSearchParam()
      params.current = this.pagination.currentPage
      params.size = this.pagination.pageSize

      this.showLoading('正在加载数据中...')
      axios({
        url: '/media_repository/mediaReport/findMediaReportPage',
        method: 'post',
        data: params
      }).then(res => {
        const listData = res.data.records
        listData.forEach(item => {
          MediaAPI.getMediaTypes()
          item.media_type_str = MediaAPI.parseMediaType(item.media_type)
          item.storey_str = MediaAPI.parseMediaStore(item.storey)
          /* tem.case_from_str =  "人工添加";
              if (item.caseFrom == 1) {
                item.case_from_str = "批量导入";
              } else if (item.caseFrom == 2) {
                item.case_from_str = "AMS";
              }
              item.media_str = this.mediaTypeParseStr(item.mediaType);

              if (item.publishTime) {
                item.publishTime = item.publishTime.substring(0, 16);
              }

              if (!item.domainName) {
                item.domainName = item.media_str;
              }

              item.checked = false;*/
        })

        this.pagination.total = res.data.total

        this.tableData = listData
        this.getSpanArr(listData)
        // console.log(this.tableData);
        this.loading.close()
      }).catch(error => {
        this.loading.close()
      })
    },
    doSearch() {
      this.pagination.currentPage = 1
      this.loadMediaReportListData()
    },
    mergeSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex == 1 || columnIndex == 6 || columnIndex == 7 || columnIndex == 8 || columnIndex == 9) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    getSpanArr(data) {
      this.spanArr = []
      let pos = 0
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1)
          pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i].id === data[i - 1].id) {
            this.spanArr[pos] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            pos = i
          }
        }
      }
    },
    handleEdit() {

    },
    getMediaOptions() {
      this.formData.mediaId = ''
      MediaAPI.mediaPager({
        storey: this.formData.media_storey,
        media_type: this.formData.media_type
      }).then(res => {
        this.mediaOptions = res.data.records
      })
    },
    toAddOrUpdatMediaReport(id) {
      const route = {
        path: '/createReports'
      }
      if (id) {
        route.query = { id: id }
      }
      const routeData = this.$router.resolve(route)
      window.open(routeData.href, '_blank')
    },
    toMediaReportView(id) {
      const route = {
        path: '/checkReports'
      }
      route.query = { id: id }
      const routeData = this.$router.resolve(route)
      window.open(routeData.href, '_blank')
    },
    getSearchParam() {
      const parmas = Object.assign({}, this.formData)
      if (this.formData.publish_time && this.formData.publish_time.length == 2) {
        parmas.start_time = this.formData.publish_time[0] + ' 00:00:00'
        parmas.end_time = this.formData.publish_time[1] + ' 23:59:59'
      }
      return parmas
    },
    showLoading(tips) {
      this.loading = this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    exportMediaReport() {
      const params = this.getSearchParam()

      const exportColumns = [
        { column: 'title', title: '标题' },
        { column: 'storey', title: '媒体层级' },
        { column: 'media_type', title: '媒体类型' },
        { column: 'media_name', title: '媒体' },
        { column: 'person_name', title: '媒体人' },
        { column: 'publish_time', title: '发布时间' },
        { column: 'created_at', title: '添加时间' },
        { column: 'creater_name', title: '操作人员' }
      ]

      params.titles = []
      params.columns = []
      exportColumns.forEach((item, index) => {
        params.titles.push(item.title)
        params.columns.push(item.column)
      })
      this.downloadFile('/media_repository/mediaReport/exportMediaReport', params)
    },
    async batchDeleteArticle() { // 批量删除
      window.location.href = 'http://www.baidu.com'
      /* if (this.tableSelectRowIds.length == 0) {
            this.$message({
              type: 'error',
              message: "请至少勾选一条数据"
            });
            return;
          }
          await this.$confirm("确定要删除所勾选数据吗？");

          let ids = this.tableSelectRowIds.join();
          axios({
            url : '/media_repository/mediaReport/deleteMediaReport?ids=' + ids,
            method : "get"
          }).then( res => {
            if (res.code == 0) {
              this.$message({
                type: 'success',
                message: "删除成功"
              });
              this.loadMediaReportListData();
            } else {
              this.$message({
                type: 'error',
                message: "删除失败"
              });
            }
          }).catch( error => {
              this.$message({
                type: 'error',
                message: error
              });
          });*/
    },
    downloadFile(url, params, fun) {
      axios({
        method: 'post',
        url: url,
        data: params,
        processData: false,
        responseType: 'blob'
      }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.ms-excel' }))
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
        this.$message({
          type: 'error',
          message: '导出异常'
        })
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>
  *{
    box-sizing: border-box;
  }

  .handler-warper{
    padding: 0 20px;
    height: 48px;
    line-height: 48px;
    font-size: 0;
  }

  .handler-warper >>> .el-button{
    padding: 0 15px;
    height: 28px;
    vertical-align: middle;
  }

  .table-content >>> .cell a{
    color: #409EFF;
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
