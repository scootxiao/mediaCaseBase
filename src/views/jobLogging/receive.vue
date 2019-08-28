<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 工作记录</el-breadcrumb-item>
        <el-breadcrumb-item>接收记录</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="switch-warper">
        <div class="switch-box">
          <el-button class="btn" type="primary" size="medium" plain @click="toRecord">我的记录</el-button>
          <el-button class="btn" type="primary" size="medium">我的接收</el-button>
        </div>
        <div class="switch-btn-group">
          <el-button type="primary" plain @click="deleteReceive">删除</el-button>
        </div>
      </div>
      <div class="handle-box">
        <el-form :inline="true" :model="formData">
          <el-select v-model="formData.keywordType">
            <el-option label="按照标题" value="title" />
            <el-option label="按发送部门" value="fromDeptName" />
            <el-option label="按发送人" value="fromUserName" />
          </el-select>
          <el-form-item>
            <el-input v-model.trim="formData.keyword" placeholder="请输入关键字" />
          </el-form-item>
          <el-form-item label="时间：">
            <el-date-picker
              v-model="formData.time"
              type="datetimerange"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-button type="primary" class="handle-search" icon="search" @click="getReceiveList"><i class="iconfont icon-chazhao" />
          </el-button>
        </el-form>
      </div>
      <div class="table-content">
        <el-table ref="singleTable" border :data="tableData" style="width: 100%" @selection-change="selectionChange">
          <el-table-column type="selection" align="center" width="50" fixed />
          <el-table-column property="title" align="left" label="标题">
            <template slot-scope="scope">
              <span style="cursor: pointer;" @click="toRecordPage(scope.row)" v-text="scope.row.title" />
            </template>
          </el-table-column>
          <el-table-column property="sendCount" align="center" width="120px" label="数量" />
          <el-table-column
            property="fromUserName"
            align="center"
            label="发送人"
            width="150px"
            show-overflow-tooltip
          />
          <el-table-column
            property="fromDeptName"
            align="center"
            label="发送部门"
            width="150px"
            show-overflow-tooltip
          />
          <el-table-column
            property="createTime"
            align="center"
            label="接收时间"
            width="180px"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>
    <div class="common-btns">
      <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        layout="total, prev, pager, next,jumper"
        :total="pagination.peopleCount"
        @size-change="paginationSizeChange"
        @current-change="paginationCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import 'static/css/mine.css'
import axios from 'axios'
export default {
  name: 'JobLogging',
  data() {
    return {
      formData: {
        keywordType: 'title',
        keyword: '',
        time: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 200
      },
      pickerOptions: {
        disabledDate(date) {
          return new Date().getTime() < new Date(date).getTime()
        }
      },
      tableData: [],
      selectedData: []
    }
  },
  computed: {},
  created() {
    this.getReceiveList()
  },
  methods: {
    paginationSizeChange(value) {
      this.pagination.pageSize = value
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
    },
    toRecord() {
      this.$router.push({
        path: '/jobLogging'
      })
    },
    toRecordPage(row) {
      this.$router.push({
        path: '/ReceiveTable',
        query: {
          id: row.id
        }
      })
      /* let route = this.$router.resolve({
                    path: '/ReceiveTable',
                    query: {
                        title: row.title,
                        recordIds: row.recordIds
                    }
                })
                window.open(route.href, '_blank');*/
    },
    getReceiveList() {
      this.showLoading('加载中，请稍侯...')
      const startTime = (this.formData.time || [])[0]
      const endTime = (this.formData.time || [])[1]
      axios.post('/media_repository/workRecord/selectReceivePage', {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize,
        title: this.formData.keywordType == 'title' ? this.formData.keyword : '',
        fromDeptName: this.formData.keywordType == 'fromDeptName' ? this.formData.keyword : '',
        fromUserName: this.formData.keywordType == 'fromUserName' ? this.formData.keyword : '',
        startTime: startTime ? startTime + ' 00:00:00' : '',
        endTime: endTime ? endTime + ' 23:59:59' : ''
      }).then(res => {
        this.loading.close()
        const data = res.data.data.records
        this.tableData = data
        this.pagination.peopleCount = res.data.data.total
      }).catch(err => {
        this.loading.close()
      })
    },
    selectionChange(selection) {
      this.selectedData = selection
    },
    async deleteReceive() {
      const ids = this.selectedData.map(item => item.id).join(',')
      if (!ids) {
        this.$message({
          type: 'warning',
          message: '需选择删除项'
        })
        return
      }
      await this.$confirm('您确定要删除勾选的数据吗？')
      this.showLoading('正在处理，请稍候...')
      axios.get(`/media_repository/workRecord/deleteReceiveByIds?ids=${ids}`).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getReceiveList()
        } else {
          this.$message({
            type: 'error',
            message: this.data.msg
          })
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
    }
  }
}
</script>

<style scoped>

</style>
