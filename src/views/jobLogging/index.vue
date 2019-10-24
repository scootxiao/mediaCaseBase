<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formData">
        <el-select
          v-model="formData.keywordType"
          class="filter-item"
          style="width:120px;"
        >
          <el-option label="按照标题" value="title" />
          <el-option label="按照媒体人" value="mediaPerson" />
        </el-select>
        <el-input
          v-model.trim="formData.keyword"
          placeholder="请输入关键字"
          maxlength="50"
          class="filter-item"
          style="width:180px;"
          prefix-icon="el-icon-search"
        />
        <!-- <media-selector
              :showStore="false"
              :showType="true"
              :showBlock="false"
              @media-change="mediaChange"
              @type-change="typeChange" /> -->
        <el-date-picker
          v-model="formData.time"
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          :unlink-panels="true"
          :editable="false"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
        />
        <el-button type="primary" class="filter-item" @click="getWorkRecordList">搜索</el-button>

        <el-button type="primary" class="filter-item" @click="toEdit">添加记录</el-button>
        <el-button type="primary" class="filter-item" @click="showSendDialog">批量发送</el-button>
        <el-button type="primary" class="filter-item" @click="deleteRecord">批量删除</el-button>
      </el-form>
    </div>

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
          <a href="#" @click="toEdit(scope.row.id)" v-text="scope.row.title" />
        </template>
      </el-table-column>
      <el-table-column
        property="mediaType"
        align="center"
        width="120px"
        label="媒体类型"
      />
      <el-table-column
        property="mediaName"
        align="center"
        label="媒体"
        width="120px"
      />
      <el-table-column
        property="mediaPersonName"
        align="center"
        label="媒体人"
        width="160px"
      />
      <el-table-column
        property="creatorName"
        align="center"
        label="记录人"
        width="160px"
      />
      <el-table-column
        property="updateTime"
        align="center"
        label="操作时间"
        width="210px"
      />
    </el-table>

    <pagination
      v-show="pagination.peopleCount>0"
      :total="pagination.peopleCount"
      :page.sync="pagination.currentPage"
      :limit.sync="pagination.pageSize"
      @pagination="getWorkRecordList('pager')"
    />
    <el-dialog
      title="批量发送"
      :visible.sync="batchSendDialog.show"
      width="50%"
    >
      <el-form>
        <el-form-item label="标题名称：" required>
          <el-input
            v-model="batchSendDialog.title"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <dept-user-tree
        :tree-data="batchSendDialog.data"
        :selected-data="batchSendDialog.selectedData"
        @change="changeSendUser"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchSendDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="sendBatch">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {
  recordList,
  getDeptUserTree,
  jobSendBatch,
  jobBatchDelete
} from '@/api/job'

import Pagination from '@/components/Pagination'
import deptUserTree from '@/components/deptUserTree'
export default {
  name: 'JobLogging',
  components: {
    Pagination,
    deptUserTree
  },
  data() {
    return {
      formData: {
        keywordType: 'title',
        keyword: '',
        mediaId: '',
        mediaType: '',
        time: ''
      },
      // minDateStamp: new Date(new Date().add(-3, 'year').format('yyyy-12-31 24:00:00')).getTime(),
      pickerOptions: {
        disabledDate: (date) => {
          const stamp = new Date(date).getTime()
          return new Date().getTime() < stamp || this.minDateStamp > stamp
        }
      },
      batchSendDialog: {
        show: false,
        title: '',
        data: [],
        selectedData: []
      },
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      tableData: [],
      selectedData: [],
      spanArr: [],
      position: 0
    }
  },
  created() {
    this.getWorkRecordList()
  },
  methods: {
    paginationSizeChange(value) {
      this.pagination.pageSize = value
      this.getWorkRecordList('pager')
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.getWorkRecordList('pager')
    },
    async getWorkRecordList(from) {
      if (from !== 'pager') {
        this.showPage = false
        this.pagination.currentPage = 1
        this.$nextTick(() => {
          this.showPage = true
        })
      }
      this.showLoading('加载中，请稍侯...')
      const isMediaPerson = this.formData.keywordType == 'mediaPerson'
      const startTime = (this.formData.time || [])[0]
      const endTime = (this.formData.time || [])[1]
      const { data: { records, total }} = await recordList({
        current: this.pagination.currentPage,
        size: this.pagination.pageSize,
        title: isMediaPerson ? '' : this.formData.keyword,
        mediaPerson: isMediaPerson ? this.formData.keyword : '',
        mediaId: this.formData.mediaId,
        mediaType: this.formData.mediaType,
        startTime: startTime ? startTime + ' 00:00:00' : '',
        endTime: endTime ? endTime + ' 23:59:59' : ''
      })
      this.loading.close()

      records.forEach(item => item.mediaType = this.getMediaTypeStr(item.mediaType))

      this.tableData = records
      this.rowspan()
      this.pagination.peopleCount = total
    },
    toEdit(id) {
      const route = this.$router.resolve({
        path: '/jobLogging/append',
        query: typeof id === 'number' ? { id } : null
      })
      window.open(route.href, '_blank')
    },
    selectionChange(selection) {
      this.selectedData = selection
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
    async showSendDialog() {
      if (this.selectedData.length < 1) {
        this.$message.warning('请至少勾选一条数据')
        return
      }
      this.batchSendDialog.show = true
      this.batchSendDialog.title = this.selectedData[0].title

      // 批量发送弹框 左边树
      const { data } = await getDeptUserTree()
      data.forEach(item => item.username = item.org_name)
      this.batchSendDialog.data = data
    },
    changeSendUser(selection) {
      this.batchSendDialog.selectedData = selection
    },
    async sendBatch() {
      if (!this.batchSendDialog.title) {
        this.$message.warning('请填写名称')
        return
      }
      if (this.batchSendDialog.selectedData.length < 1) {
        this.$message.warning('请勾选发送对象')
        return
      }
      await this.$confirm('您确定要发送吗？')

      this.showLoading('处理中，请稍候...')
      let { code, data } = await jobSendBatch({
        title: this.batchSendDialog.title,
        sendRecords: this.selectedData,
        sendUsers: this.batchSendDialog.selectedData
      })
      if (code = '0') {
        this.$message.success('发送成功')
        this.batchSendDialog.show = false
      } else {
        this.$message.error(data.msg)
      }
      this.loading.close()
    },
    async deleteRecord() {
      const ids = this.selectedData.map(item => item.id).join(',')
      if (!ids) {
        this.$message.warning('需选择删除项')
        return
      }
      await this.$confirm('您确定要删除勾选的数据吗？')

      this.showLoading('正在处理，请稍候...')
      const { code, data } = await jobBatchDelete(ids)
      if (code == '0') {
        this.$message({ type: 'success', message: '删除成功' })
        this.getWorkRecordList()
      } else {
        this.$message({ type: 'error', message: data.msg })
      }
      this.loading.close()
    },
    // mediaChange(mediaId) {
    //     this.formData.mediaId = mediaId;
    //     this.formData.mediaBlockId = '';
    // },
    // typeChange(mediaType) {
    //     this.formData.mediaType = mediaType;
    // },
    getMediaTypeStr(intValue) {
      const mediaTypes = ['', '微博', '微信', '网客户端/APP', '电视', '报纸/杂志', '广播', '新媒体', '户外媒体', '其他']
      return mediaTypes[intValue || 0] || ''
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

    .dialog-box {
        display: flex;
    }

    .tree-warper {
        padding: 10px;
        border: solid 1px #d2d8e4;
        border-radius: 5px;
    }

    .tree-box {
        margin-top: 10px;
        height: 240px;
        overflow: auto;
    }

    .list-warper {
        padding: 10px;
        border: solid 1px #d2d8e4;
        border-radius: 5px;
    }

    .list-item {
        padding: 0 20px 0 15px;
        width: 100%;
        height: 32px;
        line-height: 31px;
        color: #666;
        border-bottom: solid 1px #d2d8e4;
        position: relative;
    }

    .list-item:nth-last-child(1) {
        border: none;
    }

    .list-item .btn {
        position: absolute;
        top: 5px;
        right: 5px;
        display: none;
    }

    .list-item:hover {
        background-color: #66b1ff;
        color: #fff;
    }

    .list-item:hover .btn {
        display: block;
        color: #fff;
    }

    /deep/ .cell a{
      color: #409EFF;
    }
</style>
