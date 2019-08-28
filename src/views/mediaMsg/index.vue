<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formData">
        <el-form-item label="">
          <el-input
            v-model.trim="formData.personName"
            placeholder="请输入媒体人姓名关键字"
            maxlength="20"
          />
        </el-form-item>
        <media-selector
          @store-change="storeChange"
          @type-change="typeChange"
          @media-change="mediaChange"
          @block-change="blockChange"
        />
        <media-position
          :label="'媒体位置：'"
          :position-range="this.formData.positionRange"
          @range-change="rangeChange"
          @parent-change="parentChange"
          @position-change="positionChange"
        />
        <el-button type="primary" icon="search" @click="getMediaPersonList">查询</el-button>
      </el-form>
    </div>
    <div class="table-content">
      <el-table ref="singleTable" border :data="tableData" style="width: 100%" @selection-change="selectionChange">
        <el-table-column type="selection" align="center" width="50" fixed />
        <el-table-column property="mediaType" align="center" label="媒体类型" />
        <el-table-column
          property="storey"
          align="center"
          label="媒体层级"
          sortable
          show-overflow-tooltip
        />
        <el-table-column
          property="positionParentName"
          align="center"
          label="省/国家"
          show-overflow-tooltip
        />
        <el-table-column
          property="positionName"
          align="center"
          label="市"
          show-overflow-tooltip
        />
        <el-table-column property="mediaName" align="center" label="媒体" show-overflow-tooltip />
        <el-table-column
          property="mediaBlockName"
          align="center"
          label="板块"
          show-overflow-tooltip
        >
          <template slot-scope="scope">{{ (scope.row.mediaBlockName || '-- -- -- --').replace(/,/g, "，") }}</template>
        </el-table-column>
        <el-table-column
          property="name"
          align="center"
          label="媒体人"
          sortable
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
            <span class="relation" :class="scope.row.relation == 1 ? 'relation-red' : 'relation-yellow'">
              {{ scope.row.relation == 1 ? '密切' : '一般' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          property="job"
          align="center"
          label="媒体人职务"
          show-overflow-tooltip
        />
        <el-table-column
          property="phone"
          align="center"
          label="手机号码"
          width="180px"
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
            <el-button size="small" type="primary" plain @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
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
    <el-dialog title="导出验证" :visible.sync="exportDialog.show" width="40%">
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
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import MediaAPI from '@/api/mediaSettings'
import AreaInfoAPI from '@/api/areaInfo'
import UserAPI from '@/api/user.js'
import WaterMask from '@/utils/waterMask'
import mediaPosition from '@/components/media/mediaPosition'
import mediaSelector from '@/components/media/mediaSelector'
import FileUtil from '@/utils/file.js'
export default {
  name: 'MediaMsg',
  components: { mediaPosition, mediaSelector },
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
  computed: {},
  created() {
    this.getMediaPersonList()
  },
  mounted() {

  },
  methods: {
    paginationSizeChange(value) {
      this.pagination.pageSize = value
      this.getMediaPersonList()
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.getMediaPersonList()
    },
    handleView(value) {
      const router = this.$router.resolve({
        path: '/personLibraryCheck',
        query: {
          id: value.id
        }
      })
      window.open(router.href, '_blank')
    },
    handleEdit(value) {
      const router = this.$router.resolve({
        path: '/personLibraryCreate',
        query: {
          id: value.id
        }
      })
      window.open(router.href, '_blank')
    },
    toCreate() {
      const router = this.$router.resolve({
        path: '/personLibraryCreate'
      })
      window.open(router.href, '_blank')
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
      Object.assign(this.formData, {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize
      })
      this.showLoading('加载中，请稍候...')
      axios.post('/media_repository/mediaPerson/selectPage', this.formData).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.tableData = res.data.data.records
          this.pagination.peopleCount = res.data.data.total
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
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
      axios.get(`/media_repository/mediaPerson/deleteByIds?ids=${ids}`).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.$message.success('删除成功')
          this.getMediaPersonList()
        } else {
          this.$message.error(res.data.msg)
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
    },
    toAllLibrary() {
      this.$router.push({
        path: '/allLibrary'
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
      axios.get(`/media_repository/common/query/getPhoneVerifyCode?phone=${this.userInfo.phone}&template=1`).then(res => {
        if (res.data.code == '0') {
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
          this.$message.error(res.data.msg)
          this.exportDialog.canGetCode = true
        }
      }).catch(err => {
        this.exportDialog.canGetCode = true
      })
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
      axios({
        method: 'post',
        url: '/media_repository/mediaPerson/export',
        data,
        processData: false,
        responseType: 'blob'
      }).then(res => {
        this.loading.close()
        FileUtil.downLoadFromResponse(res, () => {
          this.exportDialog.show = false
        }, text => {
          this.$message.error(JSON.parse(text).msg)
        })
      }).catch(err => {
        this.loading.close()
      })
    }
  }
}
</script>

<style scoped>
    .relation {
        position: absolute;
        right: 0;
        top:0;
        border: 2px solid #aaa;
        font-size: smaller;
        font-weight: bold;
        padding: 2px;
        line-height: 1em;
    }
    .relation-red {
        border-color: red;
        color: red;
    }
    .relation-yellow {
        border-color: #fc0;
        color: #fc0;
    }
</style>
