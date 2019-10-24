<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form class="clearfix" :inline="true">
        <div class="title">{{ receive.title }}</div>
        <el-button type="primary" class="filter-item" style="float:right;" @click="deleteReceive">删除</el-button>
      </el-form>
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
            <a href="#" @click="toDetail(scope.row.id)">{{ scope.row.title }}</a>
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
          label="记录时间"
          width="180px"
          show-overflow-tooltip
        />
      </el-table>
      <el-pagination
        v-if="showPage"
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        layout="slot, prev, pager, next,jumper"
        :total="pagination.peopleCount"
        @size-change="paginationSizeChange"
        @current-change="paginationCurrentChange"
      >
        <span style="color:#666; font-weight: normal; margin: 0 1em;">共{{ sendCount }}条</span>
      </el-pagination>
    </div>
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings.js'
import {
  getRecordList
} from '@/api/job'


export default {
  name: 'receiveTable',
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
      showPage: true,
      receive: {},
      tableData: [],
      sendCount: 0,
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
      this.getRecordList('pager')
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.getRecordList('pager')
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
    async getRecordList(from) {
      if (!this.$route.query.id) {
        this.$message.error('ID不能为空')
        return
      }
      if (from !== 'pager') {
        this.showPage = false
        this.pagination.currentPage = 1
        this.$nextTick(() => {
          this.showPage = true
        })
      }
      this.showLoading('加载中，请稍侯...')

      let {code, msg, data} = await getRecordList(this.$route.query.id,{
        current: this.pagination.currentPage,
        size: this.pagination.pageSize
      });
      if (code === '0') {
        this.receive = data.receive
        this.tableData = data.recordPage.records
        this.sendCount = data.recordIdCount
        this.pagination.peopleCount = data.recordPage.total
        this.rowspan()
      } else {
        this.$message.error(msg)
      }
      this.loading.close();
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
      const id = this.receive.id;

      let {code, msg, data} = await deleteReceive(this.receive.id, ids);
      if (code == '0') {
        if (data == '0') {
          this.$message.success('删除成功，该记录下的所有数据均已删除')
          this.toReceive()
        } else {
          this.$message.success('删除成功')
          this.getRecordList()
        }
      } else {
        this.$message({type: 'error',message: msg})
      }
      this.loading.close()
    },
    toReceive() {
      this.$router.push({
        path: '/jobLogging/receive',
        query: this.$route.query
      })
    },
    toDetail(id) {
      const route = this.$router.resolve({
        path: '/jobLogging/check',
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
        float: left;
    }
</style>
