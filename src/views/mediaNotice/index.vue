<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体通知</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div v-if="has_management_authority && has_management_authority" class="handler-warper">
        <el-button v-if="has_management_authority" type="primary" @click="toSendMediaNotice">添加</el-button>
        <el-button v-if="has_management_authority" type="primary" plain @click="batchDeleteArticle">删除</el-button>
      </div>
      <div class="handle-box">
        <el-form :inline="true" :model="formData">
          <el-form-item label="标题：">
            <el-input
              v-model="formData.title"
              placeholder="请输入标题"
            />
          </el-form-item>
          <el-form-item label="通知时间：">
            <el-date-picker
              v-model="formData.notice_time"
              type="daterange"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
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
        <el-table ref="singleTable" border :data="tableData" highlight-current-row style="width: 100%" @selection-change="tableSelectChange">
          <el-table-column type="selection" align="center" width="50" fixed />
          <el-table-column property="title" align="left" label="标题" show-overflow-tooltip>
            <template slot-scope="scope">
              <a v-if="has_management_authority" href="javascript:;" @click="toSendMediaView(scope.row.id)">{{ scope.row.title }}</a>
              <span v-else>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column property="noticeTime" align="center" label="通知时间" width="200px" show-overflow-tooltip />
          <el-table-column property="createrName" label="操作人员" align="center" width="200px" show-overflow-tooltip />
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
import request from '@/util/request'
export default {
  name: 'MediaNotice',
  data() {
    return {
      formData: {
        title: '',
        notice_time: ''
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      tableSelectRowIds: [],
      loading: null,
      has_management_authority: false // 管理权限控制
    }
  },
  computed: {
  },
  created() {
    this.loadTableData()

    let userInfo = window.sessionStorage.getItem('user_info')
    userInfo = JSON.parse(userInfo)
    if (userInfo.user_type == 2) { // 系统管理员
      this.has_management_authority = true
    }
  },
  methods: {
    paginationSizeChange(value) {

    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.loadTableData()
    },
    loadTableData() {
      this.tableSelectRowIds = []

      const params = this.formData
      if (this.formData.notice_time && this.formData.notice_time.length == 2) {
        try {
          params.start_time = this.formData.notice_time[0] + ' 00:00:00'
          params.end_time = this.formData.notice_time[1] + ' 23:59:59'
        } catch (e) {
          console.log(e)
        }
      }
      this.showLoading('正在加载数据中...')
      request({
        url: '/media_repository/mediaNotice/findMediaNoticePage',
        method: 'post',
        data: params
      }).then(res => {
        const listData = res.data.records
        this.pagination.total = res.data.total
        this.tableData = listData
        this.loading.close()
      }).catch(error => {
        this.loading.close()
      })
    },
    tableSelectChange(selection) {
      this.tableSelectRowIds = []
      selection.forEach(node => {
        if (this.tableSelectRowIds.indexOf(node.id) == -1) {
          this.tableSelectRowIds.push(node.id)
        }
      })
    },
    doSearch() {
      this.pagination.currentPage = 1
      this.loadTableData()
    },
    toSendMediaNotice() {
      const route = {
        path: '/mediaNoticeAdd'
      }
      const routeData = this.$router.resolve(route)
      window.open(routeData.href, '_blank')
    },
    toSendMediaView(id) {
      const route = {
        path: '/mediaNoticeCheck'
      }
      route.query = { id: id }
      const routeData = this.$router.resolve(route)
      window.open(routeData.href, '_blank')
    },
    async batchDeleteArticle() { // 批量删除
      if (this.tableSelectRowIds.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少勾选一条数据'
        })
        return
      }
      await this.$confirm('确定要删除所勾选数据吗？')

      const ids = this.tableSelectRowIds.join()
      request({
        url: '/media_repository/mediaNotice/deleteMediaNotice?ids=' + ids,
        method: 'get'
      }).then(res => {
        if (res.code == 0) {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.loadTableData()
        } else {
          this.$message({
            type: 'error',
            message: '删除失败'
          })
        }
      }).catch(error => {
        this.$message({
          type: 'error',
          message: error
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

  .content-box .content .common-btns{
    width: 100%;
  }

  .table-content >>> .cell a{
    color: #409EFF;
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
</style>
