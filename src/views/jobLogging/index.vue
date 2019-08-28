<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 工作记录</el-breadcrumb-item>
        <el-breadcrumb-item>我的记录</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="switch-warper">
        <div class="switch-box">
          <el-button class="btn" type="primary" size="medium">我的记录</el-button>
          <el-button class="btn" type="primary" size="medium" plain @click="toReceive">我的接收</el-button>
        </div>
        <div class="switch-btn-group">
          <el-button type="primary" @click="toEdit">添加记录</el-button>
          <el-button type="primary" plain @click="showSendDialog">批量发送</el-button>
          <el-button type="primary" plain @click="deleteRecord">删除</el-button>
        </div>
      </div>
      <div class="handle-box">
        <el-form :inline="true" :model="formData">
          <el-select v-model="formData.keywordType" style="width: 8rem;">
            <el-option label="按照标题" value="title" />
            <el-option label="按照媒体人" value="mediaPerson" />
          </el-select>
          <el-form-item>
            <el-input v-model.trim="formData.keyword" placeholder="请输入关键字" />
          </el-form-item>
          <media-selector
            :show-store="false"
            :show-type="false"
            :show-block="false"
            @media-change="mediaChange"
            @block-change="blockChange"
          />
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
          <el-button type="primary" class="handle-search" icon="search" @click="getWorkRecordList"><i class="iconfont icon-chazhao" />
          </el-button>
        </el-form>
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
              <span style="cursor: pointer;" @click="toEdit(scope.row.id)" v-text="scope.row.title" />
            </template>
          </el-table-column>
          <el-table-column property="mediaType" align="center" width="120px" label="媒体类型" />
          <el-table-column
            property="mediaName"
            align="center"
            label="媒体"
            width="120px"
            show-overflow-tooltip
          />
          <el-table-column
            property="mediaPersonName"
            align="center"
            label="媒体人"
            width="120px"
            show-overflow-tooltip
          />
          <el-table-column
            property="creatorName"
            align="center"
            label="记录人"
            width="120px"
            show-overflow-tooltip
          />
          <el-table-column
            property="createTime"
            align="center"
            label="时间"
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

    <el-dialog
      title="批量发送"
      :visible.sync="batchSendDialog.show"
      width="55%"
    >
      <el-form label-width="5em">
        <el-form-item label="名称：" required>
          <el-input v-model="batchSendDialog.title" style="width: 80%;" maxlength="50" />
          <span style="color:#aaa;margin-left: 10px">{{ batchSendDialog.title.length }}/50</span>
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
import 'static/css/mine.css'
import mediaSelector from '@/components/page/mediaSelector'
import deptUserTree from '@/components/page/deptUserTree'
import axios from 'axios'
import UserAPI from '@/api/user'
export default {
  name: 'JobLogging',
  components: { mediaSelector, deptUserTree },
  data() {
    return {
      formData: {
        keywordType: 'title',
        keyword: '',
        mediaId: '',
        mediaBlockId: '',
        time: ''
      },
      pickerOptions: {
        disabledDate(date) {
          return new Date().getTime() < new Date(date).getTime()
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
        peopleCount: 200
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      filterText3: '',
      tableData: [],
      selectedData: [],
      spanArr: [],
      position: 0
    }
  },
  computed: {},
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.getWorkRecordList()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    paginationSizeChange(value) {
      this.pagination.pageSize = value
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
    },
    getWorkRecordList() {
      this.showLoading('加载中，请稍侯...')
      const isMediaPerson = this.formData.keywordType == 'mediaPerson'
      const startTime = (this.formData.time || [])[0]
      const endTime = (this.formData.time || [])[1]
      axios.post('/media_repository/workRecord/selectPage', {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize,
        title: isMediaPerson ? '' : this.formData.keyword,
        mediaPerson: isMediaPerson ? this.formData.keyword : '',
        mediaId: this.formData.mediaId,
        mediaBlockId: this.formData.mediaBlockId,
        startTime: startTime ? startTime + ' 00:00:00' : '',
        endTime: endTime ? endTime + ' 23:59:59' : ''
      }).then(res => {
        this.loading.close()
        const data = res.data.data.records
        data.forEach(item => item.mediaType = this.getMediaTypeStr(item.mediaType))
        this.tableData = data
        this.rowspan()
        this.pagination.peopleCount = res.data.data.total
      }).catch(err => {
        this.loading.close()
      })
    },
    toEdit(id) {
      this.$router.push({
        path: '/jobLoggingAppendRecord',
        query: typeof id === 'number' ? { id } : null
      })
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
    showSendDialog() {
      if (this.selectedData.length < 1) {
        this.$message.warning('请至少勾选一条数据')
        return
      }
      this.batchSendDialog.show = true
      this.batchSendDialog.title = this.selectedData[0].title
      if (this.batchSendDialog.data.length < 1) {
        UserAPI.getDeptUserTree().then(res => {
          res.data.forEach(item => item.username = item.org_name)
          this.batchSendDialog.data = res.data
        })
      }
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
      const data = {
        title: this.batchSendDialog.title,
        sendRecords: this.selectedData,
        sendUsers: this.batchSendDialog.selectedData
      }
      this.showLoading('处理中，请稍候...')
      axios.post('/media_repository/workRecord/sendBatch', data).then(res => {
        this.loading.close()
        if (res.data.code = '0') {
          this.$message.success('发送成功')
          this.batchSendDialog.show = false
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
        this.loading.close()
        console.error(err)
      })
    },
    async deleteRecord() {
      const ids = this.selectedData.map(item => item.id).join(',')
      if (!ids) {
        this.$message.warning('需选择删除项')
        return
      }
      await this.$confirm('您确定要删除勾选的数据吗？')
      this.showLoading('正在处理，请稍候...')
      axios.get(`/media_repository/workRecord/deleteRecordByIds?ids=${ids}`).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getWorkRecordList()
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
    mediaChange(mediaId) {
      this.formData.mediaId = mediaId
      this.formData.mediaBlockId = ''
    },
    blockChange(blockId) {
      this.formData.mediaBlockId = blockId
    },
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
</style>
