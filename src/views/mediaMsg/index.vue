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
        />
        <!-- <media-selector
          @store-change="storeChange"
          @type-change="typeChange"
          @media-change="mediaChange"
          @block-change="blockChange"
        /> -->
        <media-selector></media-selector>
        <media-position
          :label="'媒体位置：'"
          :position-range="this.formData.positionRange"
          @range-change="rangeChange"
          @parent-change="parentChange"
          @position-change="positionChange"
        />
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

    <!-- pege 表示当前第几页 total是总数 limit是每页显示多少条 getList是数据请求回调 -->
    <pagination v-show="pagination.peopleCount>0" :total="pagination.peopleCount" :page.sync="pagination.currentPage" :limit.sync="pagination.pageSize" @pagination="getMediaPersonList" />

    <!-- <el-dialog title="导出验证" :visible.sync="exportDialog.show" width="40%">
      <el-form label-width="30%" :model="exportDialog">
        <el-form-item label="操作人：">{{ exportDialog.name }}</el-form-item>
        <el-form-item label="手机验证码：" style="width: 100%">
          <el-input v-model="exportDialog.verifyCode" style="width: 60%;" @keyup.enter.native="exportExcel" />
          <el-button :disabled="!exportDialog.canGetCode" @click="getVerifyCode">{{ exportDialog.getCodeBtnText }}</el-button>
        </el-form-item>
        <el-form-item>
          <div style="color: #888; font-size: smaller;text-align: center">
            该账号绑定手机号为：{{ exportDialog.phone }}，如手机号有误请前往个人中心修改手机号
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align: center; margin-top: 2em;">
        <el-button type="primary" @click="exportExcel">确 定</el-button>
        <el-button style="margin-left: 2em;" @click="exportDialog.show = false">取 消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings'
import AreaInfoAPI from '@/api/areaInfo'
import UserAPI from '@/api/user.js'
import { getMediaPersonList, delRow } from '@/api/mediaMsg'

import WaterMask from '@/utils/waterMask'
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
      mediaOptions: [],
      mediaTypeOptions: MediaAPI.getMediaTypes(),
      mediaStoreOptions: MediaAPI.getMediaStores(),
      mediaBlockOptions: [],
      positionParentOptions: [],
      positionOptions: [],
      tableData: [],
      selection: [],
      // exportDialog: {
      //   show: false,
      //   verifyCode: '',
      //   timer: null,
      //   canGetCode: true,
      //   name: '',
      //   getCodeBtnText: '获取验证码',
      //   phone: ''
      // },
      userInfo: null
    }
  },
  computed: {},
  created() {
    this.getMediaPersonList()
  },
  mounted() {
  },
  methods: {
    handleView(value) {
      // const router = this.$router.resolve({
      //   path: '/personLibraryCheck',
      //   query: {
      //     id: value.id
      //   }
      // })
      // window.open(router.href, '_blank')
    },
    handleEdit(value) {
      // const router = this.$router.resolve({
      //   path: '/mediaMsg/create',
      //   query: {
      //     id: value.id
      //   }
      // })
      // window.open(router.href, '_blank')
      this.$router.push({
        path: '/mediaMsg/create'
      })
    },
    toCreate() {
      // const router = this.$router.resolve({
      //   path: '/mediaMsg/create'
      // })
      // window.open(router.href, '_blank')
      this.$router.push({
        path: '/mediaMsg/create'
      })
    },
    storeChange(store) {
      this.formData.storey = store
      this.formData.mediaId = ''
      this.formData.mediaBlockId = ''
    },
    typeChange(type) {
      this.formData.mediaType = type
      this.formData.mediaId = ''
      this.formData.mediaBlockId = ''
    },
    mediaChange(mediaId) {
      this.formData.mediaId = mediaId
      this.formData.mediaBlockId = ''
    },
    blockChange(blockId) {
      this.formData.mediaBlockId = blockId
    },
    rangeChange(range) {
      this.formData.positionRange = range
    },
    parentChange(parentId) {
      this.formData.positionParentId = parentId
    },
    positionChange(positionId) {
      this.formData.positionId = positionId
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
    // async deleteByIds() {
    //   const ids = (this.selection || []).map(item => item.id).join(',')
    //   if (!ids) {
    //     this.$message.warning('需选择删除项')
    //     return
    //   }
    //   await this.$confirm('您确定要删除勾选的数据吗？')
    //   this.showLoading('处理中，请稍候...')
    //   delRow(ids)
    //     .then(res=>{
    //       this.$message.success('删除成功')
    //       this.getMediaPersonList()
    //     })
    //   this.loading.close()
    // },
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
    }
    // showExportDialog() {
    //   this.exportDialog.show = true
    //   if (!this.userInfo) {
    //     UserAPI.getLoginUserInfo().then(res => {
    //       this.userInfo = res.data
    //       this.exportDialog.name = this.userInfo.username
    //       this.exportDialog.phone = (this.userInfo.phone || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    //     })
    //   }
    // },
    // getVerifyCode() {
    //   this.exportDialog.canGetCode = false
    //   axios.get(`/media_repository/common/query/getPhoneVerifyCode?phone=${this.userInfo.phone}&template=1`).then(res => {
    //     if (res.data.code == '0') {
    //       this.exportDialog.getCodeBtnText = '重新获取(60s)'
    //       this.exportDialog.timer = setInterval(() => {
    //         let num = (this.exportDialog.getCodeBtnText || '0').replace(/\D+/g, '')
    //         num -= 1
    //         if (num < 1) {
    //           clearInterval(this.exportDialog.timer)
    //           this.exportDialog.canGetCode = true
    //           this.exportDialog.getCodeBtnText = '点击获取'
    //         } else {
    //           this.exportDialog.getCodeBtnText = `重新获取(${num}s)`
    //         }
    //       }, 1000)
    //     } else {
    //       this.$message.error(res.data.msg)
    //       this.exportDialog.canGetCode = true
    //     }
    //   }).catch(err => {
    //     this.exportDialog.canGetCode = true
    //   })
    // },
    // exportExcel() {
    //   if (!/^\d{6}$/.test(this.exportDialog.verifyCode)) {
    //     this.$message.warning('请输入6位数字的验证码')
    //     return
    //   }
    //   this.showLoading('处理中，请稍候...')
    //   const data = Object.assign(this.formData, {
    //     current: 1,
    //     size: 5000,
    //     verifyCode: this.exportDialog.verifyCode
    //   })
    //   axios({
    //     method: 'post',
    //     url: '/media_repository/mediaPerson/export',
    //     data,
    //     processData: false,
    //     responseType: 'blob'
    //   }).then(res => {
    //     this.loading.close()
    //     FileUtil.downLoadFromResponse(res, () => {
    //       this.exportDialog.show = false
    //     }, text => {
    //       this.$message.error(JSON.parse(text).msg)
    //     })
    //   }).catch(err => {
    //     this.loading.close()
    //   })
    // }
  }
}
</script>
