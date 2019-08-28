<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 系统设置</el-breadcrumb-item>
        <el-breadcrumb-item>媒体设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div ref="tree_warper" class="tree-warper">
        <div class="tree-hd">
          信息列表
          <el-button type="primary" class="btn-delate" icon="el-icon-delete" @click="delTreeMedia()" />
        </div>
        <div class="tree-bd" :style="treeBoxObj">
          <el-tree
            ref="tree2"
            class="filter-tree"
            :data="data2"
            show-checkbox
            :props="defaultProps3"
            :render-content="renderContent"
            :default-expand-all="true"
            :expand-on-click-node="false"
          />
        </div>
      </div>
      <div v-show="'media'==mode" class="handle-box">
        <el-form :inline="true" :model="formData">
          <el-form-item label="所属类型：">
            <el-select v-model="formData.media_type" @change="searchMedia()">
              <el-option label="请选择" value="" />
              <el-option label="微博" value="1" />
              <el-option label="微信" value="2" />
              <el-option label="网客户端/APP" value="3" />
              <el-option label="电视" value="4" />
              <el-option label="报纸/杂志" value="5" />
              <el-option label="广播" value="6" />
              <el-option label="新媒体" value="7" />
              <el-option label="户外媒体" value="8" />
              <el-option label="其他" value="9" />
            </el-select>
          </el-form-item>
          <el-form-item label="媒体层级：">
            <el-select v-model="formData.storey" @change="searchMedia()">
              <el-option label="请选择" value="" />
              <el-option label="中央党媒" value="1" />
              <el-option label="省市级媒体" value="2" />
              <el-option label="涉大鹏媒体" value="3" />
              <el-option label="商业媒体及其他" value="4" />
            </el-select>
          </el-form-item>
          <el-input v-model="formData.name" placeholder="请输入关键字" class="handle-input mr10" />
          <el-button type="primary" class="handle-search" icon="search" @click="searchMedia()"><i class="iconfont icon-chazhao" /></el-button>
          <el-button type="primary" class="add-media" @click="showByMediaMode()">新增新媒体</el-button>
        </el-form>
      </div>
      <div v-show="'media'==mode" class="table-content">
        <el-table ref="singleTable" border :data="tableData" style="width: 100%">
          <el-table-column type="selection" align="center" width="50" fixed />
          <el-table-column property="name" align="center" label="媒体名称" />
          <el-table-column property="media_type_name" align="center" width="120px" label="媒体类型" />
          <el-table-column property="storey_name" align="center" label="媒体层级" width="120px" show-overflow-tooltip />
          <el-table-column property="person_num" align="center" label="媒体人数量" width="120px" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="360px">
            <template slot-scope="scope">
              <el-button size="small" type="primary" plain @click="showMediaBlockMode(scope.row)">查看板块</el-button>
              <el-button size="small" type="primary" plain @click="showAddMediaBlock(scope.row)">新增板块</el-button>
              <el-button size="small" type="primary" plain @click="showByMediaMode(scope.row)">编辑</el-button>
              <el-button v-if="scope.row.person_num > 0" disabled="disabled" size="small" type="primary" plain>删除</el-button>
              <el-button v-else size="small" type="primary" plain @click="delByMedia(scope.row)">删除</el-button>
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
          @current-change="paginationCurrentChange"
        />
      </div>

      <div v-show="'module'==mode" class="handle-box" style="height:62px;line-height:45px;">
        <el-form :inline="true" :model="formData">
          {{ check_media_name }}
          <el-button type="primary" class="add-media" @click="hideMediaBlockMode();">返回</el-button>
        </el-form>
      </div>
      <!-- 媒体版块mode -->
      <div v-show="'module'==mode" class="table-content">
        <el-table ref="singleTable" border :data="checkedTableData" style="width: 100%">
          <el-table-column type="selection" align="center" width="50" fixed />
          <el-table-column property="name" align="center" label="版块名称" />
          <el-table-column label="操作" align="center" width="360px">
            <template slot-scope="scope">
              <el-button size="small" type="primary" plain @click="showEditModule(scope.row)">编辑</el-button>
              <el-button v-if="scope.row.person_num > 0" size="small" disabled="disabled" type="primary" plain>删除</el-button>
              <el-button v-else size="small" type="primary" plain @click="delByMediaBlock(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="'module'==mode" class="common-btns">
        <el-pagination
          :current-page="paginations.currentPage"
          :page-size="paginations.pageSize"
          layout="total, prev, pager, next,jumper"
          :total="paginations.peopleCount"
          @current-change="paginationsCurrentChange"
        />
      </div>

    </div>
    <el-dialog
      :title="addMeidaDialog.name"
      :visible.sync="addMeidaDialog.show"
      width="45%"
    >
      <el-form ref="addMeidaFormData" :model="addMeidaFormData" :rules="addMeidaRules" label-width="100px">
        <el-input v-model="addMeidaFormData.id" style="display:none;" />
        <el-form-item label="媒体类型：" prop="media_type">
          <el-select v-model="addMeidaFormData.media_type" style="width:100%;">
            <el-option label="微博" value="1" />
            <el-option label="微信" value="2" />
            <el-option label="网客户端/APP" value="3" />
            <el-option label="电视" value="4" />
            <el-option label="报纸/杂志" value="5" />
            <el-option label="广播" value="6" />
            <el-option label="新媒体" value="7" />
            <el-option label="户外媒体" value="8" />
            <el-option label="其他" value="9" />
          </el-select>
        </el-form-item>
        <el-form-item label="媒体名称：" prop="name">
          <el-input v-model="addMeidaFormData.name" />
        </el-form-item>
        <el-form-item label="媒体层级：">
          <el-select v-model="addMeidaFormData.storey" style="width:100%;" prop="storey">
            <el-option label="中央党媒" value="1" />
            <el-option label="省市级媒体" value="2" />
            <el-option label="涉大鹏媒体" value="3" />
            <el-option label="商业媒体及其他" value="4" />
          </el-select>
        </el-form-item>
        <media-position
          :label="'媒体位置：'"
          :select-style="'width:calc(33% - 2px);'"
          :position-range="addMeidaFormData.position1"
          :position-parent-id="addMeidaFormData.position2"
          :position-id="addMeidaFormData.position3"
          @range-change="mediaPositionRangeChange"
          @parent-change="mediaPositionProvinceChange"
          @position-change="mediaPositionChange"
        />
        <el-form-item label="媒体logo：">
          <el-upload
            class="upload-demo"
            action="/media_repository/media/uploadLogo"
            :headers="headers"
            :data="{mediaId: addMeidaFormData.id}"
            :on-preview="handlePreview"
            :before-remove="handleRemove"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :file-list="fileList2"
            :multiple="false"
            :limit="1"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过200kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addMeidaDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="saveMedia()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="新增板块"
      :visible.sync="addModuleDialog.show"
      width="30%"
    >
      <el-form ref="addModuleFormData" :model="addModuleFormData" :rules="addModuleRules" label-width="100px">
        <el-input v-model="addModuleFormData.id" style="display:none;" />
        <el-input v-model="addModuleFormData.media_id" style="display:none;" />
        <el-input v-model="addModuleFormData.media_type" style="display:none;" />
        <el-input style="display:none;" />
        <el-form-item label="媒体类型：">
          {{ addModuleFormData.media_type_name }}
        </el-form-item>
        <el-form-item label="所属媒体：">
          {{ addModuleFormData.media_name }}
        </el-form-item>
        <el-form-item label="板块名称：" prop="name">
          <el-input v-model="addModuleFormData.name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addModuleDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="saveMediaBlock()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import 'static/css/mine.css'
import { getMediaTree,
  mediaPager,
  mediaBlockPager,
  findMedia,
  mediaPositionProvince,
  mediaPositionCity,
  addMedia,
  updateMedia,
  delByMedia,
  delTreeMedia,
  addMediaBlock,
  updateMediaBlock,
  findByMediaBlock,
  delByMediaBlock,
  changeSort
} from '@/api/mediaSettings'
import mediaPosition from '@/components/page/mediaPosition'

// import axios from 'axios'
export default {
  name: 'MediaSettings',
  components: { mediaPosition },
  data() {
    var validateMediaName = (rule, value, callback) => {
      if (value !== '') {
        const cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g
        const mat = value.match(cnReg)
        let lengths
        if (mat) {
          lengths = (mat.length + (value.length - mat.length) * 0.5) * 2
        } else {
          lengths = value.length
        }
        if (lengths > 0 && lengths < 11) {
          callback()
        } else {
          callback(new Error('请输入10字符以内的媒体名称'))
        }
      } else {
        callback(new Error('请输入媒体名称'))
      }
    }

    var validateModuleName = (rule, value, callback) => {
      if (value !== '') {
        const cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g
        const mat = value.match(cnReg)
        let lengths
        if (mat) {
          lengths = (mat.length + (value.length - mat.length) * 0.5) * 2
        } else {
          lengths = value.length
        }
        if (lengths > 0 && lengths < 11) {
          callback()
        } else {
          callback(new Error('请输入10字符以内的版块名称'))
        }
      } else {
        callback(new Error('请输入版块名称'))
      }
    }

    return {
      mode: 'media',
      headers: {
        Authorization: 'Bearer ' + sessionStorage.access_token
      },
      formData: {
        media_type: '',
        storey: '',
        name: ''
      },
      addModuleDialog: {
        show: false,
        name: '新增版块'
      },
      addModuleFormData: {
        name: '',
        id: '',
        media_id: '',
        media_name: '',
        media_type: '',
        media_type_name: ''
      },
      addModuleRules: {
        name: [
          { validator: validateModuleName, trigger: 'blur' }
        ]
      },
      addMeidaFormData: {
        media_type: '',
        storey: '',
        name: '',
        position1: '',
        position2: '',
        position3: '',
        id: ''
      },
      addMeidaRules: {
        media_type: [
          { required: true, message: '请选择媒体类型', trigger: 'change' }
        ],
        storey: [
          { required: true, message: '请选择媒体层级', trigger: 'change' }
        ],
        name: [
          { validator: validateMediaName, trigger: 'blur' }
        ],
        position1: [
          { required: true, message: '请选择媒体位置', trigger: 'change' }
        ],
        position2: [
          { required: true, message: '请选择媒体位置', trigger: 'change' }
        ],
        position3: [
          { required: true, message: '请选择媒体位置', trigger: 'change' }
        ]
      },
      addMeidaDialog: {
        show: false,
        name: '新增媒体'
      },
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      paginations: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      fileList2: [],
      data2: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      filterText3: '',
      defaultProps3: {
        children: 'children',
        label: 'label'
      },
      checkedTableData: [// 媒体版块数据展示变量
      ],
      tableData: [
      ],
      check_media_name: '', // 查看媒体版块时的媒体名称
      check_media_id: '', // 查看媒体版块时的媒体id
      check_media_type: '', // 查看媒体版块时的媒体类型
      check_media_type_name: '', // 查看媒体版块时的媒体类型名称
      // position_province_data:[],//媒体位置（外国国名或中国省名）
      // position_city_data:[],//媒体位置（外国省名或中国市名）
      treeBoxObj: {
        height: '320px'
      }
    }
  },
  computed: {
  },
  watch: {

  },

  created() {
    this.loadMedia()
  },
  mounted() {
    this.treeBoxObj.height = this.$refs.tree_warper.scrollHeight - 160 + 'px'
  },
  methods: {
    renderContent(h, { node, data, store }) {
      const sortBtnsStyle = {
        display: node.level > 1 ? 'inline' : 'none'
      }
      let children = []; let index = 0
      let disUp = true; let disDown = true
      if (node.level > 1) {
        children = node.parent.data.children
        index = node.parent.data.children.findIndex(item => item.id == data.id)
        const length = node.parent.data.children.length
        if (index > 0) {
          disUp = false
        }
        if (index < length - 1) {
          disDown = false
        }
      }

      const _label = node.label.length > 6 ? (node.label.substr(0, 6) + '...') : node.label

      return (
        <div class='btn-group-warper'>
          <span class='label'>{_label}</span>
          <div class='btn-group' style={sortBtnsStyle}>
            <el-button class='btn' type='text' icon='el-icon-upload2' disabled={disUp}
              on-click={() => this.sort(children, index, index - 1)}></el-button>
            <el-button class='btn' type='text' icon='el-icon-download' disabled={disDown}
              on-click={() => this.sort(children, index, index + 1)}></el-button>
          </div>
        </div>
      )
    },
    sort(data, index1, index2) {
      changeSort(data[index1].id, data[index2].id).then(res => {
        [data[index1], data[index2]] = [data[index2], data[index1]]
        this.data2 = [...this.data2]
      })
    },
    handleRemove(file) {
      return true
    },
    handlePreview(file) {
      console.log(file)
    },
    beforeUpload(file) {
      return new Promise((resolve, reject) => {
        const size = file.size / 1024
        if (size > 200) {
          this.$message({
            type: 'warning',
            message: '请上传小于200K的图片'
          })
          reject('超过200K，不允许上传')
        } else {
          resolve('ok')
        }
      })
    },
    handleSuccess(response, file, fileList) {
      if (response.code == '0') {
        console.log(response.data)
        this.fileList2 = [{ url: response.data.fileData }]
        this.addMeidaFormData.file_id = response.data.fileInfo.id
      } else {
        this.$message({
          type: 'error',
          message: response.msg
        })
      }
    },
    paginationCurrentChange(value) {
      this.pagination.currentPage = value
      this.loadMediaPager()
    },
    paginationsCurrentChange(value) {
      this.paginations.currentPage = value
      this.loadMediaBlockPager()
    },
    loadMediaTree() {
      getMediaTree({})
        .then(res => {
          this.data2 = res.data.data
        })
    },
    loadMediaPager() {
      mediaPager({
        'current': this.pagination.currentPage,
        'size': this.pagination.pageSize,
        'media_type': this.formData.media_type,
        'storey': this.formData.storey,
        'name': this.formData.name
      })
        .then(res => {
          if (res && res.data && res.data.records) {
            this.tableData = res.data.records
            this.pagination.currentPage = res.data.current
            this.pagination.pageSize = res.data.size
            this.pagination.peopleCount = res.data.total
          }
        })
    },
    searchMedia() {
      this.pagination.currentPage = 1
      this.pagination.peopleCount = 0
      this.loadMediaPager()
    },
    loadMediaBlockPager() {
      mediaBlockPager({
        'current': this.paginations.currentPage,
        'size': this.paginations.pageSize,
        'media_id': this.check_media_id
      })
        .then(res => {
          if (res && res.data && res.data.records) {
            this.checkedTableData = res.data.records
            this.paginations.currentPage = res.data.current
            this.paginations.pageSize = res.data.size
            this.paginations.peopleCount = res.data.total
          }
        })
    },
    showMediaBlockMode(row) {
      if (row.id) {
        this.paginations.currentPage = 1
        this.paginations.peopleCount = 0
        this.mode = 'module'
        this.check_media_name = row.name
        this.check_media_id = row.id
        this.check_media_type_name = row.media_type_name
        this.check_media_type = row.media_type
        this.loadMediaBlockPager()
      }
    },
    hideMediaBlockMode() {
      this.mode = 'media'
    },
    showByMediaMode(row) {
      this.addMeidaDialog.show = true
      this.clearMediaForm()
      this.addMeidaDialog.name = '新增媒体'
      if (row && row.id) {
        this.addMeidaDialog.name = '编辑媒体'
        this.findByMedia(row.id)
      }
    },
    hideByMediaMode() {
      this.addMeidaDialog.show = false
    },
    clearMediaForm() {
      // 清空媒体位置信息
      this.addMeidaFormData.position1 = ''
      this.addMeidaFormData.position2 = ''
      this.addMeidaFormData.position3 = ''

      this.addMeidaFormData.name = ''// 清空媒体名称
      this.addMeidaFormData.media_type = ''// 清空媒体类型
      this.addMeidaFormData.storey = ''// 清空媒体层级
      this.addMeidaFormData.id = ''// 清空媒体id
      this.addMeidaFormData.file_id = null
      this.fileList2 = []
    },
    findByMedia(id) {
      const _this = this
      findMedia({ 'id': id })
        .then(res => {
          if (res && res.data && res.data.data) {
            const media = res.data.data
            _this.addMeidaFormData.id = media.id
            _this.addMeidaFormData.name = media.name
            _this.addMeidaFormData.media_type = media.media_type + ''
            _this.addMeidaFormData.storey = media.storey + ''
            _this.addMeidaFormData.position1 = media.position_range + ''
            _this.addMeidaFormData.position2 = Number(media.position_parent_id)
            _this.addMeidaFormData.position3 = Number(media.position_id)
            if (media.file_data) {
              this.fileList2 = [{
                url: media.file_data
              }]
            } else {
              this.fileList2 = []
            }
          }
        })
    },
    mediaPositionRangeChange(val) {
      this.addMeidaFormData.position1 = val
      this.addMeidaFormData.position2 = ''
      this.addMeidaFormData.position3 = ''
      // this.loadMediaPositionProvince(this.addMeidaFormData.position1);
    },
    mediaPositionProvinceChange(val) {
      this.addMeidaFormData.position2 = val
      this.addMeidaFormData.position3 = ''
    },
    mediaPositionChange(val) {
      this.addMeidaFormData.position3 = val
    },
    saveMedia() {
      if (this.addMeidaFormData.id) {
        updateMedia({
          'media_type': this.addMeidaFormData.media_type,
          'storey': this.addMeidaFormData.storey,
          'name': this.addMeidaFormData.name,
          'position_range': this.addMeidaFormData.position1,
          'position_parent_id': this.addMeidaFormData.position2,
          'position_id': this.addMeidaFormData.position3,
          'checkType': 'update', // 重命名验证参数
          'id': this.addMeidaFormData.id
        })
          .then(res => {
            if (res && res.data) {
              if (res.data.code) {
                if (Number(res.data.code) == 1) {
                  this.$message.success('编辑成功')
                  this.loadMediaPager()
                  this.addMeidaDialog.show = false
                } else if (Number(res.data.code) == -1) {
                  this.$message.error('媒体名称已存在,请修改媒体名称!')
                } else {
                  this.$message.error('媒体编辑失败!')
                }
              }
            }
          })
      } else {
        addMedia({
          'media_type': this.addMeidaFormData.media_type,
          'storey': this.addMeidaFormData.storey,
          'name': this.addMeidaFormData.name,
          'position_range': this.addMeidaFormData.position1,
          'position_parent_id': this.addMeidaFormData.position2,
          'position_id': this.addMeidaFormData.position3,
          'checkType': 'add'// 重命名验证参数
        })
          .then(res => {
            if (res && res.data) {
              if (res.data.code) {
                if (Number(res.data.code) == 1) {
                  this.$message.success('新增成功')
                  this.loadMediaPager()
                  this.addMeidaDialog.show = false
                } else if (Number(res.data.code) == -1) {
                  this.$message.error('媒体名称已存在,请修改媒体名称!')
                } else {
                  this.$message.error('媒体新增失败!')
                }
              }
            }
          })
      }
    },
    delByMedia(row) {
      if (row && row.id) {
        this.$confirm('删除该媒体/板块，媒体包含的板块将同时删除，确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delByMedia({
            'id': row.id
          })
            .then(res => {
              if (res && res.data && res.data.code && Number(res.data.code) == 1) {
                this.$message.success('媒体/版块删除成功')
                this.loadMediaTree()
                this.searchMedia()
              } else {
                this.$message.error('媒体/版块删除失败!')
              }
            })
        })
      }
    },
    delTreeMedia() {
      const nodes = this.$refs.tree2.getCheckedNodes()
      let media_ids = ''
      let media_num = 0
      let media_block_ids = ''
      let media_block_num = 0
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.id.indexOf('m_') != -1) {
          media_ids += ',' + node.id.replace('m_', '')
          media_num++
        }
        if (node.id.indexOf('mb_') != -1) {
          media_block_ids += ',' + node.id.replace('mb_', '')
          media_block_num++
        }
      }
      if ((media_ids.length > 1 && media_num > 0) || (media_block_ids.length > 1 && media_block_num > 0)) {
        this.$confirm('删除该媒体/板块，媒体包含的板块将同时删除，确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delTreeMedia({
            'media_ids': media_ids ? media_ids.substr(1) : '',
            'media_num': media_num,
            'media_block_ids': media_block_ids ? media_block_ids.substr(1) : 0,
            'media_block_num': media_block_num
          })
            .then(res => {
              if (res && res.data && res.data.code && Number(res.data.code) == 1) {
                this.$message.success('媒体/版块删除成功')
                this.loadMedia()
              } else {
                this.$message.error('媒体/版块删除失败!')
              }
            })
        })
      }
    },
    showAddMediaBlock(row) {
      this.addModuleDialog.show = true
      this.addModuleFormData.media_id = row.id
      this.addModuleFormData.media_name = row.name
      this.addModuleFormData.media_type = row.media_type
      this.addModuleFormData.media_type_name = row.media_type_name
    },
    showEditModule(row) {
      this.findByMediaBlock(row.id)
    },
    findByMediaBlock(id) {
      findByMediaBlock({
        'id': id
      })
        .then(res => {
          if (res && res.data && res.data.data) {
            const mb = res.data.data
            this.addModuleFormData = mb
            /* this.addModuleFormData.media_id = mb.media_id;
                this.addModuleFormData.media_name = mb.media_name;
                this.addModuleFormData.media_type = mb.media_type;
                this.addModuleFormData.media_type_name = mb.media_type_name;
                this.addModuleFormData.name = mb.name;
                this.addModuleFormData.id = mb.id;*/
            this.addModuleDialog.show = true
          }
        })
    },
    saveMediaBlock() {
      if (this.addModuleFormData.id) {
        updateMediaBlock({
          'id': this.addModuleFormData.id,
          'media_id': this.addModuleFormData.media_id,
          'media_type': this.addModuleFormData.media_type,
          'name': this.addModuleFormData.name,
          'checkType': 'update'
        })
          .then(res => {
            if (res && res.data && res.data.code) {
              if (Number(res.data.code) == 1) {
                this.$message.success('版块编辑成功')
                this.loadMediaBlockPager()
                this.addModuleDialog.show = false
                this.addModuleFormData.name = ''
              } else if (Number(res.data.code) == -1) {
                this.$message.error('该媒体已存在此板块!')
              } else {
                this.$message.error('版块编辑失败!')
              }
            } else {
              this.$message.error('版块编辑失败!')
            }
          })
      } else {
        addMediaBlock({
          'media_id': this.addModuleFormData.media_id,
          'media_type': this.addModuleFormData.media_type,
          'name': this.addModuleFormData.name,
          'checkType': 'add'
        })
          .then(res => {
            if (res && res.data && res.data.code) {
              if (Number(res.data.code) == 1) {
                this.$message.success('版块新增成功')
                this.loadMedia()
                this.addModuleDialog.show = false
                this.addModuleFormData.name = ''
              } else if (Number(res.data.code) == -1) {
                this.$message.error('该媒体已存在此板块!')
              } else {
                this.$message.error('版块新增失败!')
              }
            } else {
              this.$message.error('版块新增失败!')
            }
          })
      }
    },
    delByMediaBlock(row) {
      this.$confirm('您确认删除该板块？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delByMediaBlock({
          'id': row.id
        })
          .then(res => {
            if (res && res.data && res.data.code && Number(res.data.code) == 1) {
              this.$message.success('版块删除成功')
              this.loadMedia()
              this.loadMediaBlockPager()
            } else {
              this.$message.error('版块删除失败!')
            }
          })
      })
    },
    loadMedia() {
      this.loadMediaTree()
      this.loadMediaPager()
    }
  }
}
</script>

<style scoped>
  *{
    box-sizing: border-box;
  }

  .container{
    padding-left: 250px;
  }

  .content-box .content .common-btns{
    left: 250px;
  }

  .handle-box{
    padding-bottom: 0;
  }

  .tree-warper{
    position: absolute;
    top: 40px;
    bottom: 0px;
    left: 0;
    width: 250px;
    border-right: solid 1px #d2d8e4;
  }

  .tree-hd{
    padding: 10px 5px;
    width: 100%;
    height: 62px;
    line-height: 42px;
    font-size: 16px;
    font-weight: 600;
    color: #000;
    background-color: #f1f2f3;
  }

  .tree-hd .btn-delate{
    margin-top: 10px;
    margin-right: 10px;
    float: right;
  }

  .tree-bd{
    position: absolute;
    top: 62px;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    overflow: auto;
  }

  .add-media{
    float: right;
  }

  .container >>> .btn-group-warper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  /* .container >>> .btn-group-warper{
    padding-right: 80px;
    position: relative;
    box-sizing: border-box;
  }

  .container >>> .btn-group-warper .label{
    width: 100%;
    height: 32px;
    line-height: 32px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .container >>> .btn-group-warper .btn-group{
    position: absolute;
    top: 0;
    right:0;
  }*/

  .container >>> .btn-group-warper .btn{
    margin: 0;
    padding: 2px 3px;
    font-size: 13px;
  }

</style>
