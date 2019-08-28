<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体信息</el-breadcrumb-item>
        <el-breadcrumb-item>全库</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="switch-warper">
        <div class="switch-box">
          <el-button class="btn" type="primary" size="medium" plain @click="toPersonalLibrary">个人库</el-button>
          <el-button class="btn" type="primary" size="medium">全库</el-button>
        </div>
        <div v-if="userType != 1" class="switch-btn-group">
          <el-button type="primary" plain @click="downloadTemplate">导入模板</el-button>
          <el-button type="primary" plain @click="selectImportFile">导入</el-button>
          <el-button type="primary" plain @click="showExportDialog">导出</el-button>
          <input id="import-file" type="file" style="display: none" accept=".xlsx" @change="importMediaPerson">
        </div>
      </div>
      <div class="handle-box">
        <el-form :inline="true" :model="formData">
          <el-select v-model="keywordType">
            <el-option label="按媒体人" value="personName" />
            <el-option label="按负责人" value="chargeByName" />
            <el-option v-if="userType == 3" label="按负责部门" value="chargeByDeptName" />
          </el-select>
          <el-form-item label="">
            <el-input v-model.trim="keyword" placeholder="输入关键字" maxlength="20" />
          </el-form-item>
          <media-selector
            @store-change="storeChange"
            @type-change="typeChange"
            @media-change="mediaChange"
            @block-change="blockChange"
          />
          <media-position
            :label="'位置：'"
            :position-range="this.formData.positionRange"
            @range-change="rangeChange"
            @parent-change="parentChange"
            @position-change="positionChange"
          />
          <el-button type="primary" class="handle-search" icon="search" @click="getMediaPersonList"><i class="iconfont icon-chazhao" />
          </el-button>
        </el-form>
      </div>
      <div class="table-content">
        <el-table ref="singleTable" border :data="tableData" style="width: 100%">
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
          <el-table-column property="chargeByDeptName" align="center" label="负责部门" show-overflow-tooltip />
          <el-table-column property="chargeByName" align="center" label="负责人" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="180px">
            <template slot-scope="scope">
              <el-button size="small" type="primary" plain @click="handleView(scope.row)">查看</el-button>
              <!--<el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>-->
            </template>
          </el-table-column>
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
import 'static/css/mine.css'
import MediaAPI from '@/api/mediaSettings'
import AreaInfoAPI from '@/api/areaInfo'
import UserAPI from '@/api/user.js'
import WaterMask from '@/util/waterMask'
import mediaPosition from '@/components/page/mediaPosition'
import mediaSelector from '@/components/page/mediaSelector'
import FileUtil from '@/util/file.js'

export default {
  name: 'MediaMsg',
  components: { mediaPosition, mediaSelector },
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
      mediaOptions: [],
      mediaTypeOptions: MediaAPI.getMediaTypes(),
      mediaStoreOptions: MediaAPI.getMediaStores(),
      mediaBlockOptions: [],
      positionParentOptions: [],
      positionOptions: [],
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
  computed: {},
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
    const type = JSON.parse(sessionStorage.getItem('user_info') || '{}').user_type
    this.userType = type
  },
  mounted() {
    /* this.$nextTick(() => {
                document.querySelector("div.content").style.overflow = 'hidden';
                WaterMask.add('div.content', localStorage.ms_username || '泥煤的', {
                    x_space: 100,
                    color: '#ccc'
                });
            });*/
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
    showLoading(tips) {
      this.loading = this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    toPersonalLibrary() {
      this.$router.push({
        path: '/mediaMsg'
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
          this.exportDialog.getCodeBtnText = '重新获取(60)'
          this.exportDialog.timer = setInterval(() => {
            let num = (this.exportDialog.getCodeBtnText || '0').replace(/\D+/g, '')
            num -= 1
            if (num < 1) {
              clearInterval(this.exportDialog.timer)
              this.exportDialog.canGetCode = true
              this.exportDialog.getCodeBtnText = '点击获取'
            } else {
              this.exportDialog.getCodeBtnText = `重新获取(${num})`
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
    },
    downloadTemplate() {
      this.showLoading('处理中，请稍侯...')
      axios.get('/media_repository/mediaPerson/downloadTemplate', {
        responseType: 'arraybuffer'
      }).then(res => {
        this.loading.close()
        FileUtil.downLoadFromResponse(res, null, text => {
          this.$message.error(JSON.parse(text).msg)
        })
      }).catch(err => {
        this.loading.close()
      })
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
      axios.post('/media_repository/mediaPerson/importBatch', params, headers).then(res => {
        this.loading.close()
        if (res.data.code != '0') {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            duration: 0,
            showClose: true,
            message: res.data.msg || '导入失败'
          })
          return
        } else {
          this.$message.success('导入成功')
          this.getMediaPersonList()
        }
      }).catch(err => {
        this.loading.close()
      })
      document.querySelector('#import-file').value = null
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
