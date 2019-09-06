<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formData">
        <el-select v-model="keywordType" class="filter-item" style="width:120px;">
          <el-option label="按媒体人" value="personName" />
          <el-option label="按负责人" value="chargeByName" />
          <el-option v-if="userType == 3" label="按负责部门" value="chargeByDeptName" />
        </el-select>
        <el-input
          v-model.trim="keyword"
          class="filter-item"
          style="width:180px;"
          placeholder="输入关键字"
          maxlength="20"
          prefix-icon="el-icon-search"
        />
        <media-selector @mediaChange="mediaChange" />
        <media-position @positionChange="positionChange" />
        <el-button class="filter-item" type="primary" @click="getMediaPersonList">查询</el-button>
        <el-button class="filter-item" type="primary" @click="downloadTemplate">导入模板</el-button>
        <el-button class="filter-item" type="primary" @click="selectImportFile">导入</el-button>
        <el-button class="filter-item" type="primary" @click="showExportDialog">导出</el-button>
        <input id="import-file" type="file" style="display: none" accept=".xlsx" @change="importMediaPerson">
      </el-form>
    </div>
    <el-table ref="singleTable" :data="tableData" style="width: 100%">
      <el-table-column type="selection" align="center" width="50" fixed />
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
      <el-table-column
        property="job"
        align="center"
        label="媒体人职务"
        width="100px"
        show-overflow-tooltip
      />
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
      <el-table-column label="亲密性" align="center" width="100px">
        <template slot-scope="scope">
          <svg-icon icon-class="star" class="meta-item__icon" />
          <svg-icon v-if="scope.row.relation == 1" icon-class="star" class="meta-item__icon" />
          <svg-icon v-if="scope.row.relation == 1" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>
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
      <el-table-column property="chargeByName" align="center" label="负责人" show-overflow-tooltip width="100px" />
      <el-table-column label="操作" align="center" width="80px">
        <template slot-scope="scope">
          <el-button type="primary" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="pagination.peopleCount>0" :total="pagination.peopleCount" :page.sync="pagination.currentPage" :limit.sync="pagination.pageSize" @pagination="getMediaPersonList" />

    <el-dialog title="导出验证" :visible.sync="exportDialog.show" width="35%">
      <el-form label-width="120px" :model="exportDialog">
        <el-form-item label="操作人：">{{ exportDialog.name }}</el-form-item>
        <el-form-item label="手机验证码：">
          <el-input v-model="exportDialog.verifyCode" style="width:calc(100% - 150px)" @keyup.enter.native="exportExcel" />
          <el-button :disabled="!exportDialog.canGetCode" @click="getVerifyCode">{{ exportDialog.getCodeBtnText }}</el-button>
        </el-form-item>
        <el-form-item>
          <div class="tip">
            该账号绑定手机号为：{{ exportDialog.phone }}，如手机号有误请前往个人中心修改手机号
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportExcel">确 定</el-button>
        <el-button style="margin-left: 2em;" @click="exportDialog.show = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings'
import AreaInfoAPI from '@/api/areaInfo'
import UserAPI from '@/api/user.js'
import { getMediaPersonList, delRow } from '@/api/mediaMsg'

import FileUtil from '@/utils/file.js'

import mediaPosition from '@/components/media/mediaPosition'
import mediaSelector from '@/components/media/mediaSelector'
import Pagination from '@/components/Pagination'

export default {
  name: 'MediaMsg',
  components: { mediaPosition, mediaSelector, Pagination },
  data() {
    return {
      formData: {
        personName: '',
        chargeByName: '',
        chargeByDeptName: '',
        storey: '',
        mediaType: '',
        mediaId: '',
        mediaBlockId: '',
        positionRange: '',
        positionParentId: '',
        positionId: '',
        type: '2'
      },
      keywordType: 'personName',
      keyword: '',
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      tableData: [],
      exportDialog: {
        show: false,
        verifyCode: '',
        timer: null,
        canGetCode: true,
        name: '',
        getCodeBtnText: '获取验证码',
        phone: ''
      },
      userInfo: null,
      // 1-普通用户；2-管理员；3-系统管理员
      userType: 1
    }
  },
  watch: {
    keywordType(val) {
      this.formData.personName = ''
      this.formData.chargeByName = ''
      this.formData.chargeByDeptName = ''
      this.keyword = ''
    },
    keyword(val) {
      this.formData[this.keywordType] = val
    }
  },
  created() {
    this.getMediaPersonList()
    // let type = JSON.parse(sessionStorage.getItem("user_info") || "{}").user_type;
    // this.userType = type;
  },
  methods: {
    // 层级媒体类型
    mediaChange(value) {
      Object.assign(this.formData, { ...value })
    },
    // 媒体位置
    positionChange(value) {
      Object.assign(this.formData, { ...value })
    },
    handleView(value) {
      this.$router.push({
        path: '/mediaMsg/check',
        query: {
          id: value.id
        }
      })
    },
    getMediaPersonList() {
      Object.assign(this.formData, {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
      this.showLoading('加载中，请稍候...')
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
    showLoading(tips) {
      this.loading = this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    showExportDialog() {
      this.exportDialog.show = true
      if (!this.userInfo) {
        UserAPI.getLoginUserInfo().then(res => {
          this.userInfo = res.data
          this.exportDialog.name = this.userInfo.username
          this.exportDialog.phone = (this.userInfo.phone || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        })
      }
    },
    getVerifyCode() {
      this.exportDialog.canGetCode = false
      // axios.get(`/media_repository/common/query/getPhoneVerifyCode?phone=${this.userInfo.phone}&template=1`).then(res => {
      //   if (res.data.code == '0') {
      //     this.exportDialog.getCodeBtnText = '重新获取(60)'
      //     this.exportDialog.timer = setInterval(() => {
      //       let num = (this.exportDialog.getCodeBtnText || '0').replace(/\D+/g, '')
      //       num -= 1
      //       if (num < 1) {
      //         clearInterval(this.exportDialog.timer)
      //         this.exportDialog.canGetCode = true
      //         this.exportDialog.getCodeBtnText = '点击获取'
      //       } else {
      //         this.exportDialog.getCodeBtnText = `重新获取(${num})`
      //       }
      //     }, 1000)
      //   } else {
      //     this.$message.error(res.data.msg)
      //     this.exportDialog.canGetCode = true
      //   }
      // }).catch(err => {
      //   this.exportDialog.canGetCode = true
      // })
    },
    exportExcel() {
      if (!/^\d{6}$/.test(this.exportDialog.verifyCode)) {
        this.$message.warning('请输入6位数字的验证码')
        return
      }
      this.showLoading('处理中，请稍候...')
      const data = Object.assign(this.formData, {
        current: 1,
        size: 5000,
        verifyCode: this.exportDialog.verifyCode
      })
      // axios({
      //   method: 'post',
      //   url: '/media_repository/mediaPerson/export',
      //   data,
      //   processData: false,
      //   responseType: 'blob'
      // }).then(res => {
      //   this.loading.close()
      //   FileUtil.downLoadFromResponse(res, () => {
      //     this.exportDialog.show = false
      //   }, text => {
      //     this.$message.error(JSON.parse(text).msg)
      //   })
      // }).catch(err => {
      //   this.loading.close()
      // })
    },
    downloadTemplate() {
      this.showLoading('处理中，请稍侯...')
      // axios.get('/media_repository/mediaPerson/downloadTemplate', {
      //   responseType: 'arraybuffer'
      // }).then(res => {
      //   this.loading.close()
      //   FileUtil.downLoadFromResponse(res, null, text => {
      //     this.$message.error(JSON.parse(text).msg)
      //   })
      // }).catch(err => {
      //   this.loading.close()
      // })
    },
    selectImportFile() {
      document.querySelector('#import-file').click()
    },
    importMediaPerson() {
      const file = document.querySelector('#import-file').files[0]
      if (!file) {
        this.$message.warning('未选择文件')
        return
      }
      const params = new FormData()
      params.append('ignoreMode', false)
      params.append('file', file)
      const headers = { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' }}
      this.showLoading('处理中，请稍候...')
      // axios.post('/media_repository/mediaPerson/importBatch', params, headers).then(res => {
      //   this.loading.close()
      //   if (res.data.code != '0') {
      //     this.$message({
      //       type: 'error',
      //       dangerouslyUseHTMLString: true,
      //       duration: 0,
      //       showClose: true,
      //       message: res.data.msg || '导入失败'
      //     })
      //     return
      //   } else {
      //     this.$message.success('导入成功')
      //     this.getMediaPersonList()
      //   }
      // }).catch(err => {
      //   this.loading.close()
      // })
      document.querySelector('#import-file').value = null
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

