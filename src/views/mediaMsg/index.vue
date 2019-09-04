<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formData">
        <el-input
          v-model.trim="formData.personName"
          placeholder="媒体人姓名关键字"
          maxlength="20"
          class="filter-item"
          style="width:180px;"
          prefix-icon="el-icon-search"
        />
        <media-selector @mediaChange="mediaChange" />
        <media-position @positionChange="positionChange" />
        <el-button type="primary" class="filter-item" icon="search" @click="getMediaPersonList">查询</el-button>
        <el-button type="primary" class="filter-item" style="margin-left:30px;" @click="toCreate">新建</el-button>
        <el-button type="primary" class="filter-item" @click="showExportDialog">导出</el-button>
        <el-button type="primary" class="filter-item" @click="deleteByIds">删除</el-button>
      </el-form>
    </div>
    <el-table
      ref="singleTable"
      highlight-current-row
      style="width: 100%;"
      :data="tableData"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" align="center" width="50" fixed />
      <el-table-column
        property="storey"
        align="center"
        label="媒体层级"
        sortable
        width="120px"
        show-overflow-tooltip
      />
      <el-table-column property="mediaType" align="left" label="媒体类型 > 媒体 > 板块" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.mediaType }} >
          {{ scope.row.mediaName }} >
          {{ (scope.row.mediaBlockName || '未知').replace(/,/g, "，") }}
        </template>
      </el-table-column>
      <el-table-column property="mediaType" align="left" label="省/国家 > 市" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.positionParentName }} >
          {{ scope.row.positionName }}
        </template>
      </el-table-column>
      <el-table-column
        property="name"
        align="center"
        label="媒体人"
        sortable
        width="120"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="亲密性" align="center" width="100px">
        <template slot-scope="scope">
          <svg-icon icon-class="star" class="meta-item__icon" />
          <svg-icon v-if="scope.row.relation == 1" icon-class="star" class="meta-item__icon" />
          <svg-icon v-if="scope.row.relation == 1" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>
      <el-table-column
        property="job"
        align="center"
        label="媒体人职务"
        width="100px"
        show-overflow-tooltip
      />
      <el-table-column
        property="phone"
        align="center"
        label="手机号码"
        width="150px"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>
            <span v-text="scope.row.phone" />
            <i class="el-icon-view" style="cursor: pointer; margin-left: 1em;" @click="togglePhone(scope.$index)" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="pagination.peopleCount>0" :total="pagination.peopleCount" :page.sync="pagination.currentPage" :limit.sync="pagination.pageSize" @pagination="getMediaPersonList" />

    <el-dialog title="导出验证" :visible.sync="exportDialog.show" width="35%">
      <el-form label-width="120px" :model="exportDialog">
        <el-form-item label="操作人：">
          <el-input v-model="exportDialog.name" :disabled="true"></el-input>
          </el-form-item>
        <el-form-item label="手机验证码：">
          <el-input v-model="exportDialog.verifyCode" style="width:calc(100% - 150px)" @keyup.enter.native="exportExcel" />
          <el-button style="margin-left:25px;width:120px;" :disabled="!exportDialog.canGetCode" @click="getVerifyCode">{{ exportDialog.getCodeBtnText }}</el-button>
        </el-form-item>
        <el-form-item>
          <div class="tip">
            该账号绑定手机号为：{{ exportDialog.phone }}，如手机号有误请前往个人中心修改手机号
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportExcel">确 定</el-button>
        <el-button @click="exportDialog.show = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FileUtil from '@/utils/file.js'

import mediaPosition from '@/components/media/mediaPosition'
import mediaSelector from '@/components/media/mediaSelector'
import Pagination from '@/components/Pagination'

import {  getMediaPersonList, 
          delRow, 
          getLoginUserInfo,
          getVerifyCode,
          exportExcel } from '@/api/mediaMsg'

export default {
  name: 'MediaMsg',
  components: { mediaPosition, mediaSelector, Pagination },
  data() {
    return {
      formData: {
        personName: '',
        storey: '',
        mediaType: '',
        mediaId: '',
        mediaBlockId: '',
        positionRange: '',
        positionParentId: '',
        positionId: '',
        type: '1'
      },
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      tableData: [],
      selection: [],
      exportDialog: {
        show: false,
        verifyCode: '',
        timer: null,
        canGetCode: true,
        name: '',
        getCodeBtnText: '获取验证码',
        phone: ''
      },
      userInfo: null
    }
  },
  created() {
    this.getMediaPersonList()
  },
  methods: {
    // 层级媒体类型
    mediaChange(value){
      Object.assign(this.formData, {...value})
    },
    // 媒体位置
    positionChange(value){
      Object.assign(this.formData, {...value})
    },
    handleView(value) {
      this.$router.push({
        path: '/mediaMsg/create',
        query: {
          id: value.id
        }
      })
    },
    handleEdit(value) {
      this.$router.push({
        path: '/mediaMsg/create',
        query: {
          id: value.id
        }
      })
    },
    toCreate() {
      this.$router.push({
        path: '/mediaMsg/create'
      })
    },
    selectionChange(selection) {
      this.selection = selection
    },
    getMediaPersonList() {
      this.showLoading('加载中，请稍候...')
      Object.assign(this.formData, {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
      getMediaPersonList(this.formData).then(res => {
        const { data } = res
        this.tableData = data.records
        this.pagination.peopleCount = data.total
        this.loading.close()
      })
    },
    togglePhone(index) {
      const phone = this.tableData[index].phone
      if (phone.indexOf('*') == -1) {
        this.tableData[index].phone = (this.tableData[index].realPhone || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      } else {
        this.tableData[index].phone = this.tableData[index].realPhone
      }
    },
    async deleteByIds() {
      const ids = (this.selection || []).map(item => item.id).join(',')
      if (!ids) {
        this.$message.warning('需选择删除项')
        return
      }
      await this.$confirm('您确定要删除勾选的数据吗？')
      this.showLoading('处理中，请稍候...')
      console.log("ids:",ids);
      delRow(ids)
        .then(res=>{
          this.$message.success('删除成功')
          this.getMediaPersonList()
        })
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
    toAllLibrary() {
      this.$router.push({
        path: '/mediaMsg/all'
      })
    },
    showExportDialog() {
      this.exportDialog.show = true
      if (!this.userInfo) {
        getLoginUserInfo().then(res => {
          this.userInfo = res.data
          this.exportDialog.name = this.userInfo.username
          this.exportDialog.phone = (this.userInfo.phone || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        })
      }
    },
    // 获取验证码 
    getVerifyCode() {
      this.exportDialog.canGetCode = false
      getVerifyCode(this.userInfo.phone)
        .then(res=>{
          this.exportDialog.getCodeBtnText = '重新获取(60s)'
          if (res.code == '0') {
            this.exportDialog.getCodeBtnText = '重新获取(60s)'
            this.exportDialog.timer = setInterval(() => {
              let num = (this.exportDialog.getCodeBtnText || '0').replace(/\D+/g, '')
              num -= 1
              if (num < 1) {
                clearInterval(this.exportDialog.timer)
                this.exportDialog.canGetCode = true
                this.exportDialog.getCodeBtnText = '点击获取'
              } else {
                this.exportDialog.getCodeBtnText = `重新获取(${num}s)`
              }
            }, 1000)
          } else {
            this.$message.error(res.msg)
            this.exportDialog.canGetCode = true
          }
        })
        .catch(err => {
          this.exportDialog.canGetCode = true
        })
    },
    exportExcel() {
      if (!/^\d{6}$/.test(this.exportDialog.verifyCode)) {
        this.$message.warning('请输入6位数字的验证码')
        return
      }
      this.showLoading('处理中，请稍候...')
      exportExcel(
        Object.assign(this.formData, {
          current: 1,
          size: 5000,
          verifyCode: this.exportDialog.verifyCode
        })
      )
        .then(res=>{
          this.loading.close()
          FileUtil.downLoadFromResponse(res, () => {
            this.exportDialog.show = false
          }, text => {
            this.$message.error(JSON.parse(text).msg)
          })
        })
        .catch(err => {
          this.loading.close()
        })
    }
  }
}
</script>
<style lang="sass" scoped>
  .tip
    width: 80%
    line-height: 24px
    font-size: 12px
    color: #f00
    text-align: left
</style>
