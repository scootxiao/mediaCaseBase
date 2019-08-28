<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 工作记录</el-breadcrumb-item>
        <el-breadcrumb-item>我的接收</el-breadcrumb-item>
        <el-breadcrumb-item>{{ receive.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <div class="title">{{ receive.title }}</div>
        <div class="btn-group">
          <el-button type="primary" @click="deleteReceive">删除</el-button>
          <el-button type="primary" @click="toReceive">返回上层</el-button>
        </div>
      </div>
      <div class="table-content">
        <el-table
          ref="singleTable"
          border
          :data="tableData"
          style="width: 100%"
          :span-method="spanMethod"
          @selection-change="selectionChange"
        >
          <el-table-column type="selection" align="center" width="50" fixed />
          <el-table-column property="title" align="left" label="标题">
            <template slot-scope="scope">
              <span style="cursor: pointer" @click="toDetail(scope.row.id)">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column property="mediaType" align="center" width="120px" label="媒体类型">
            <template slot-scope="scope">
              <span>{{ scope.row.mediaType | mediaTypeFT }}</span>
            </template>
          </el-table-column>
          <el-table-column property="mediaName" align="center" width="120px" label="媒体" />
          <el-table-column
            property="mediaPersonName"
            align="center"
            label="媒体人"
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
import MediaAPI from '@/api/mediaSettings.js'
import axios from 'axios'

export default {
  name: 'JobLogging',
  filters: {
    mediaTypeFT(val) {
      return MediaAPI.parseMediaType(val)
    }
  },
  data() {
    return {
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      receive: {},
      tableData: [],
      selectedData: [],
      spanArr: [],
      position: 0
    }
  },
  computed: {},
  created() {
    this.getRecordList()
  },
  methods: {
    paginationSizeChange(value) {
      this.pagination.pageSize = value
      this.getRecordList()
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.getRecordList()
    },
    rowspan() {
      this.spanArr = []
      this.tableData.forEach((item, index) => {
        if (index === 0) {
          this.spanArr.push(1)
          this.position = 0
        } else {
          if (this.tableData[index].id === this.tableData[index - 1].id) {
            this.spanArr[this.position] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            this.position = index
          }
        }
      })
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex <= 1) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    getRecordList() {
      if (!this.$route.query.id) {
        this.$message.error('ID不能为空')
        return
      }
      this.showLoading('加载中，请稍侯...')
      axios.post(`/media_repository/workRecord/selectPageByReceiveId/${this.$route.query.id}`, {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize
      }).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.receive = res.data.data.receive
          this.tableData = res.data.data.recordPage.records
          this.pagination.peopleCount = res.data.data.recordPage.total
          this.rowspan()
        } else {
          this.$message.error(res.data.msg)
        }
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
        this.$message.warning('需选择删除项')
        return
      }
      await this.$confirm('您确定要删除勾选的数据吗？')
      this.showLoading('正在处理，请稍候...')
      const id = this.receive.id
      axios.get(`/media_repository/workRecord/deleteRecordUnderReceive?id=${id}&recordIds=${ids}`).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          if (res.data.data == '0') {
            this.$message.success('删除成功，该记录下的所有数据均已删除')
            this.toReceive()
          } else {
            this.$message.success('删除成功')
            this.getRecordList()
          }
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
    toReceive() {
      this.$router.push({
        path: '/jobLoggingReceive'
      })
    },
    toDetail(id) {
      const route = this.$router.resolve({
        path: '/jobLoggingCheckRecord',
        query: {
          recordId: id
        }
      })
      window.open(route.href, '_blank')
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
        position: relative;
    }

    .title {
        max-width: 60%;
        line-height: 36px;
        font-size: 16px;
        font-weight: 600;
        color: #000;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .btn-group {
        position: absolute;
        top: 15px;
        right: 20px;
    }
</style>
