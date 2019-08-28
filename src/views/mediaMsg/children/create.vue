<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体信息</el-breadcrumb-item>
        <el-breadcrumb-item>个人库</el-breadcrumb-item>
        <el-breadcrumb-item>新建</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="hd">
        <i class="el-icon-menu" /> 媒体人信息
      </div>
      <el-form :model="formData" class="commonForm" label-width="120px">
        <el-form-item label="媒体类型：" required="">
          <el-select
            v-model="formData.mediaType"
            style="width:100%;"
            clearable
            placeholder="请选择媒体类型"
            @change="getMediaOptions"
          >
            <el-option v-for="m in mediaTypeOptions" :key="m.value" :label="m.name" :value="parseInt(m.value)" />
          </el-select>
        </el-form-item>
        <!--<el-form-item label="媒体层级：" required="">
                    <el-select v-model="formData.storey" style="width:100%;" @change="getMediaOptions" clearable>
                        <el-option v-for="m in mediaStoreOptions" :label="m.name" :value="m.value" :key="m.value"></el-option>
                    </el-select>
                </el-form-item>
                <media-position :label="'媒体位置：'" :positionRange="formData.positionRange" @range-change="rangeChange"
                        :required="true"  @parent-change="parentChange" @position-change="positionChange"
                        :selectStyle="'width:calc(33% - 2px)'"></media-position>-->
        <el-form-item label="媒体：" required="">
          <el-select v-model="formData.mediaId" style="width:100%;" placeholder="请选择媒体" filterable @change="getMediaBlockOptions">
            <el-option v-for="m in mediaOptions" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="媒体人姓名：" required="">
          <el-input v-model.trim="formData.name" placeholder="请输入中英文名字" maxlength="50" />
        </el-form-item>
        <el-form-item label="媒体人职务：" required="">
          <el-input v-model.trim="formData.job" maxlength="50" />
        </el-form-item>
        <el-form-item label="合作亲密度：" required="">
          <el-select v-model="formData.relation" style="width:100%;">
            <el-option label="一般" :value="0" />
            <el-option label="密切" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码：" required="">
          <el-input v-model="formData.phone" placeholder="" maxlength="11" class="input-with-select" @keyup.native="onlyNumber('phone')">
            <el-select slot="prepend" v-model="phonePrefix" placeholder="" style="width:80px;" disabled>
              <el-option label="+86" value="+86" />
            </el-select>
          </el-input>
          <el-checkbox v-model="formData.receivePhoneNotice" label="接受通知" name="receivePhoneNotice" />
        </el-form-item>
        <el-form-item label="负责板块：">
          <el-select v-model="mediaBlockIds" style="width:100%;" multiple>
            <el-option v-for="m in mediaBlockOptions" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱：">
          <el-input v-model="formData.email" maxlength="50" @keyup.native="notSpace('email')" />
          <el-checkbox v-model="formData.receiveEmailNotice" label="接受通知" name="receiveEmailNotice" />
        </el-form-item>
        <el-form-item label="座机：">
          <el-input v-model="formData.landline" maxlength="50" @keyup.native="onlyNumber('landline')" />
        </el-form-item>
        <el-form-item label="QQ：">
          <el-input v-model="formData.qqNum" maxlength="50" @keyup.native="onlyNumber('qqNum')" />
        </el-form-item>
        <el-form-item label="微信：">
          <el-input v-model="formData.wxNum" maxlength="50" @keyup.native="notSpace('wxNum')" />
        </el-form-item>
        <el-form-item label="微博：">
          <el-input v-model="formData.weibo" maxlength="50" @keyup.native="notSpace('weibo')" />
        </el-form-item>
        <el-form-item label="办公地点：">
          <el-input v-model="formData.workPlace" maxlength="100" @keyup.native="notSpace('workPlace')" />
        </el-form-item>
        <el-form-item label="生日：">
          <el-input v-model="formData.birthday" maxlength="50" @keyup.native="notSpace('birthday')" />
        </el-form-item>
      </el-form>
      <div class="hd">
        <i class="el-icon-menu" /> 负责维护人员信息
      </div>
      <el-form class="commonForm" label-width="120px">
        <el-form-item label="负责人：" required="">
          <el-select v-model="formData.chargeBy" placeholder="请选择" filterable style="width: 100%">
            <el-option-group
              v-for="group in userTree"
              :key="group.org_name"
              :label="group.org_name"
            >
              <el-option
                v-for="item in group.userList"
                :key="item.id"
                :label="item.username"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="负责部门：" required="">{{ formData.chargeByDeptName }}</el-form-item>
        <el-form-item label="职务：">{{ formData.chargeByPosition }}</el-form-item>
        <el-form-item label="其他维护人：">
          <el-select
            v-model="otherChargers"
            placeholder="请选择"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option-group
              v-for="group in userTree"
              :key="group.org_name"
              :label="group.org_name"
            >
              <el-option
                v-for="item in group.userList"
                :key="item.id"
                :label="item.username"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
          <div class="tips">*其他维护人，可多名，同为维护人对媒体人管理享有相同的权限</div>
        </el-form-item>
      </el-form>
    </div>
    <div class="common-btns">
      <el-button type="primary" @click="saveOrUpdate">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings'
import mediaPosition from '@/components/page/mediaPosition.vue'
import UserAPI from '@/api/user'
import axios from 'axios'
import deptUserTree from '@/components/page/deptUserTree.vue'
import DeptUserTree from '../../deptUserTree'
export default {
  name: 'MediaMsg',
  components: { DeptUserTree, mediaPosition },
  data() {
    return {
      formData: {
        mediaType: '',
        storey: '',
        positionRange: '1',
        positionParentId: '',
        positionId: '',
        mediaId: '',
        name: '',
        job: '',
        relation: '',
        phone: '',
        receivePhoneNotice: false,
        email: '',
        receiveEmailNotice: false,
        landline: '',
        qqNum: '',
        wxNum: '',
        weibo: '',
        workPlace: '',
        birthday: '',
        chargeBy: '',
        chargeByName: '',
        chargeByDeptId: '',
        chargeByDeptName: '',
        chargeByPosition: ''
      },
      phonePrefix: '+86',
      mediaTypeOptions: MediaAPI.getMediaTypes(),
      mediaStoreOptions: MediaAPI.getMediaStores(),
      mediaOptions: [],
      mediaBlockIds: [],
      mediaBlockOptions: [],
      principalDialog: {
        show: false
      },
      maintainerDialog: {
        show: false
      },
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
      userTree: [],
      otherChargers: []
    }
  },
  computed: {
    userList() {
      const list = []
      this.userTree.forEach(dept => {
        (dept.userList || []).forEach(user => {
          list.push(user)
        })
      })
      return list
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    },
    'formData.chargeBy': function(val) {
      const index = this.userList.findIndex(item => item.id == val)
      if (index == -1) {
        this.$message.warning('未找到该用户')
        return
      }
      const user = this.userList[index]
      this.formData.chargeByPosition = user.position
      this.formData.chargeByName = user.username
      const deptid = user.orgid
      if (!deptid) {
        this.formData.chargeByDeptName = '用户部门ID为空'
        return
      }
      this.formData.chargeByDeptId = deptid
      UserAPI.getUserDeptInfo(deptid).then(res => {
        this.formData.chargeByDeptName = res.data.org_name
      }).catch(err => {
        this.formData.chargeByDeptName = '获取部门信息失败'
      })
    }
  },
  async created() {
    const data = await UserAPI.getDeptUserTree()
    this.userTree = data.data
    this.getMediaOptions()
    this.initFormData()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getMediaOptions() {
      this.formData.mediaId = ''
      this.mediaBlockIds = []
      this.mediaBlockOptions = []
      MediaAPI.mediaPager({
        storey: this.formData.storey,
        media_type: this.formData.mediaType,
        position_range: this.formData.positionRange,
        position_parent_id: this.formData.positionParentId,
        position_id: this.formData.positionId,
        size: 10086
      }).then(res => {
        this.mediaOptions = res.data.records
      })
    },
    getMediaBlockOptions() {
      this.mediaBlockIds = []
      MediaAPI.mediaBlockPager({
        media_id: this.formData.mediaId,
        size: 10086
      }).then(res => {
        this.mediaBlockOptions = res.data.records
      })
    },
    rangeChange(range) {
      this.formData.positionRange = range
      this.formData.positionParentId = ''
      this.formData.positionId = ''
      this.getMediaOptions()
    },
    parentChange(parentId) {
      this.formData.positionParentId = parentId
      this.formData.positionId = ''
      this.getMediaOptions()
    },
    positionChange(positionId) {
      this.formData.positionId = positionId
      this.getMediaOptions()
    },
    onlyNumber(column) {
      this.formData[column] = (this.formData[column] || '').replace(/\D+/g, '')
    },
    notSpace(column) {
      this.formData[column] = (this.formData[column] || '').replace(/\s+/g, '')
    },
    cancel() {
      window.close()
    },
    initFormData() {
      if (!this.$route.query.id) {
        UserAPI.getLoginUserInfo().then(res => {
          const user = res.data
          this.formData.chargeBy = user.id
        })
      } else {
        this.showLoading('加载中，请稍候...')
        axios.get(`/media_repository/mediaPerson/selectById/${this.$route.query.id}`).then(res => {
          this.loading.close()
          this.formData = res.data.data.person
          this.otherChargers = res.data.data.otherChargers.map(item => item.userId)
          this.getMediaBlockOptions()
          this.getMediaInfo(this.formData.id)
        }).catch(err => {
          this.loading.close()
        })
      }
    },
    getMediaInfo(personId) {
      if (!personId) {
        return
      }
      axios.get(`/media_repository/mediaPerson/selectMediaInfoByPersonId/${personId}`).then(res => {
        this.mediaBlockIds = res.data.data.mediaBlockInfos.map(item => item.id)
      })
    },
    showPrincipalDialog() {
      this.principalDialog.show = true
    },
    async saveOrUpdate() {
      await this.$confirm('您确定要保存修改吗？')
      const otherChargers = []
      this.otherChargers.forEach(id => {
        const index = this.userList.findIndex(item => item.id == id)
        otherChargers.push({
          userId: id,
          userName: (this.userList[index] || {}).username
        })
      })
      const personBlocks = []
      this.mediaBlockIds.forEach(mediaBlockId => {
        personBlocks.push({ mediaBlockId })
      })
      this.showLoading('处理中，请稍候...')
      axios.post('/media_repository/mediaPerson/saveOrUpdate', {
        person: this.formData,
        otherChargers,
        personBlocks
      }).then(res => {
        this.loading.close()
        if (res.data.code == '0') {
          this.$message.success('保存成功')
          setTimeout(this.cancel, 3000)
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
    }
  }
}
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    .hd {
        padding: 5px 20px;
        line-height: 25px;
        font-size: 14px;
        font-weight: 600;
        color: #000;
        background-color: #f1f2f3;
        border-bottom: solid 1px #d2d8e4;
    }

    .hd i {
        color: #2a68c9;
    }

    .warper {
        height: 180px;
        overflow: auto;
        border: solid 1px #d2d8e4;
        border-radius: 3px;
    }

    .panel {
        border: solid 1px #d2d8e4;
        border-radius: 3px;
    }

    .panel .panel-hd {
        padding: 0 15px;
        height: 35px;
        line-height: 33px;
        font-size: 14px;
        color: #333;
        border-bottom: solid 1px #d2d8e4;
        position: relative;
    }

    .panel .panel-hd .btn {
        position: absolute;
        top: 6px;
        right: 10px;
    }

    .panel .panel-bd {
        height: 240px;
        overflow: auto;
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

    .tips {
        margin-top: 10px;
        line-height: 24px;
        font-size: 12px;
        color: #f00;
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

    .dialog-box {
        display: flex;
    }
</style>
