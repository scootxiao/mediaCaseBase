<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" style="border-right:1px solid #aaa;">
        <div class="hd">
          <i class="el-icon-menu" /> 媒体人信息
        </div>
        <el-form :model="formData" class="commonForm" label-width="120px">
          <el-form-item label="媒体人姓名：" required="">
            <el-input v-model.trim="formData.name" placeholder="请输入中英文名字" maxlength="50" />
          </el-form-item>
          <el-form-item label="媒体人职务：" required="">
            <el-input v-model.trim="formData.job" maxlength="50" />
          </el-form-item>
          <!-- <el-form-item label="媒体路径：" required="">
                  <el-cascader
                    placeholder="媒体类型>媒体>板块"
                    :options="options"
                    :props="props"
                    clearable
                    separator=">"
                    v-model="mediaValue"
                    style="width:100%;"
                  >
                  </el-cascader>
                </el-form-item> -->
          <el-form-item label="媒体类型：" required="">
            <el-select
              v-model="formData.mediaType"
              style="width:100%;"
              placeholder="请选择媒体类型"
              @change="getMediaOptions"
            >
              <el-option v-for="m in mediaTypeOptions" :key="m.value" :label="m.name" :value="parseInt(m.value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="媒体：" required="">
            <el-select v-model="formData.mediaId" style="width:100%;" placeholder="请选择媒体" filterable @change="getMediaBlockOptions">
              <el-option v-for="m in mediaOptions" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责板块：">
            <el-select v-model="mediaBlockIds" style="width:100%;" multiple>
              <el-option v-for="m in mediaBlockOptions" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="媒体层级：" required="">
            <el-input v-model="formData.mediaStore" disabled />
          </el-form-item>
          <el-form-item label="媒体位置：" required="">
            <el-input v-model="formData.mediaPosition" disabled />
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
          <el-form-item label="邮箱：">
            <el-input v-model="formData.email" maxlength="50" @keyup.native="notSpace('email')" />
            <el-checkbox v-model="formData.receiveEmailNotice" label="接受通知" name="receiveEmailNotice" />
          </el-form-item>
          <el-form-item label="座机：">
            <el-input v-model="formData.landline" maxlength="50" />
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
      </el-col>
      <el-col :span="12">
        <div class="hd">
          <i class="el-icon-menu" /> 负责维护人员信息
        </div>
        <el-form class="commonForm" label-width="120px">
          <el-form-item label="负责人：" required="">
            <el-select v-model="formData.chargeBy" placeholder="请选择" filterable maxlength="10" style="width: 100%">
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
          <el-form-item label="负责部门：" required="">
            <el-input v-model="formData.chargeByDeptName" disabled />
          </el-form-item>
          <el-form-item label="职务：">
            <el-input v-model="formData.chargeByPosition" disabled />
          </el-form-item>
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
                  :label="item.username + ' (' + group.org_name + ')'"
                  :value="item.id"
                  :disabled="formData.chargeBy == item.id"
                >
                  {{ item.username }}
                </el-option>
              </el-option-group>
            </el-select>
            <div class="tips">*其他维护人，可多名，同为维护人对媒体人管理享有相同的权限</div>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <div class="footer">
      <el-button type="primary" size="medium" @click="saveOrUpdate">保存</el-button>
      <el-button size="medium" @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings'
import UserAPI from '@/api/user'
import axios from 'axios'

import { getDeptUserTree,
  getLoginUserInfo,
  getUserDeptInfo,
  getDetail,
  mediaPager,
  mediaBlockPager,
  saveOrUpdate,
  getMediaInfo,
  getPositionInfo } from '@/api/mediaMsg'

export default {
  name: 'MediaMsgCreate',
  data() {
    return {
      formData: {
        mediaType: '', // 媒体类型
        storey: '', // 层级
        positionRange: '', // 国内 国外
        positionParentId: '', // 省/国家 市
        positionId: '', // 具体市
        mediaId: '', // 媒体
        name: '', // 媒体人姓名
        job: '', // 媒体人职务
        relation: '', // 合作亲密度
        phone: '', // 电话
        receivePhoneNotice: false, // 接收电话信息
        email: '', // 邮件
        receiveEmailNotice: false, // 接收邮件信息
        landline: '', // 座机
        qqNum: '',
        wxNum: '',
        weibo: '',
        workPlace: '', // 办公地点
        birthday: '', // 生日

        chargeBy: '', // 负责人
        chargeByName: '',
        chargeByDeptId: '',
        chargeByDeptName: '', // 负责部门
        chargeByPosition: '' // 职务
      },
      mediaStore: '-- -- -- --', // 媒体层级
      mediaPosition: '-- -- -- --', // 媒体位置
      phonePrefix: '+86',
      mediaTypeOptions: MediaAPI.getMediaTypes(), // 媒体类型选项
      mediaStoreOptions: MediaAPI.getMediaStores(), // 媒体层次选项
      mediaOptions: [], // 媒体选项
      mediaBlockIds: [], // 负责板块
      mediaBlockOptions: [], // 负责选项
      userTree: [], // 负责维护人选项
      otherChargers: [], // 其他维护人
      disableSave: false, // 保存标志位

      mediaValue: ['', '', ''],
      props: {
        lazy: true,
        lazyLoad: this.lazyLoad,
        multiple: true
      },
      options: []
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
    'formData.chargeBy': async function(val) {
      const index = this.userList.findIndex(item => item.id == val)
      if (index == -1) {
        this.$message.warning('未找到该用户')
        return
      }
      const user = this.userList[index]
      this.formData.chargeByPosition = user.position || '-- -- -- --'
      this.formData.chargeByName = user.username
      const deptid = user.orgid
      if (!deptid) {
        this.formData.chargeByDeptName = '用户部门ID为空'
        return
      }
      this.formData.chargeByDeptId = deptid

      // 获取 请求负责部门数据
      const { data } = await getUserDeptInfo(deptid)
      this.formData.chargeByDeptName = data.org_name

      this.otherChargers = this.otherChargers.filter(item => item != val)
    },
    'formData.mediaId': function(val) {
      this.showMediaInfo(val)
    }
  },
  async created() {
    // 负责维护人员信息
    const { data } = await getDeptUserTree(1)
    this.userTree = data

    // 媒体路径初始化
    this.optionsInit()

    // 初始化表单
    this.initFormData()
  },
  methods: {
    optionsInit() {
      this.options = MediaAPI.getMediaTypes().map((item, index) => { return { value: item.value, label: item.name } })
      this.mediaValue = ['', '', '']
    },
    lazyLoad(node, resolve) {
      const { level } = node
      console.log('node:', node, 'level:', level)
      if (level === 1) {
        MediaAPI.mediaPager({ // 通过 层级 + 媒体类型获取第二级数据
          storey: this.storey, // 层级
          media_type: node.value // 媒体类型
        }).then(res => {
          resolve(this.createNodes(res.data.records))
        })
      } if (level === 2) {
        MediaAPI.mediaBlockPager({
          media_id: node.value
        }).then(res => {
          resolve(this.createNodes(res.data.records, { leaf: true }))
        })
      }
    },
    createNodes(value, curObj) {
      const newNodes = value.map((item, index) => {
        return {
          ...item,
          label: item.name,
          value: item.id,
          ...curObj
        }
      })
      return newNodes
    },

    // 展示 媒体层级 媒体媒体板块
    async showMediaInfo(mediaId) {
      console.log('mediaId:', mediaId)
      if (!mediaId) {
        this.mediaStore = '-- -- -- --'
        this.mediaPosition = '-- -- -- --'
        return
      }
      let index = this.mediaOptions.findIndex(item => item.id == mediaId)
      if (index == -1) {
        this.mediaStore = '-- -- -- --'
        this.mediaPosition = '-- -- -- --'
        return
      }
      const media = this.mediaOptions[index]

      const { data } = await getPositionInfo(mediaId)
      this.mediaPosition = `${media.position_range == '2' ? '国外' : '国内'} - ${data.positionParentName} - ${data.positionName}`

      index = this.mediaStoreOptions.findIndex(item => item.value == media.storey)
      if (index == -1) {
        this.mediaStore = '-- -- -- --'
        return
      }
      this.mediaStore = this.mediaStoreOptions[index].name
    },
    async getMediaOptions(clear = true) {
      if (clear) {
        this.formData.mediaId = ''
        this.mediaBlockIds = []
        this.mediaBlockOptions = []
      }
      const { data } = await mediaPager({
        storey: this.formData.storey,
        media_type: this.formData.mediaType,
        position_range: this.formData.positionRange,
        position_parent_id: this.formData.positionParentId,
        position_id: this.formData.positionId,
        size: 10086
      })
      this.mediaOptions = data.records // 媒体option选项
    },
    async getMediaBlockOptions() {
      this.mediaBlockIds = []
      var { data } = await mediaBlockPager({
        media_id: this.formData.mediaId,
        size: 10086
      })
      // console.log("板块data:",data)
      this.mediaBlockOptions = data.records
    },
    onlyNumber(column) {
      this.formData[column] = (this.formData[column] || '').replace(/\D+/g, '')
    },
    notSpace(column) {
      this.formData[column] = (this.formData[column] || '').replace(/\s+/g, '')
    },
    cancel() {
      // window.close()
    },
    async initFormData() {
      if (!this.$route.query.id) {
        const { data } = await getLoginUserInfo()
        this.formData.chargeBy = data.id
        // console.log("chargeBy:",this.formData.chargeBy)
      } else {
        this.showLoading('加载中，请稍候...')
        const { data } = await getDetail(this.$route.query.id)
        this.formData = data.person

        // 其他维护人
        this.otherChargers = data.otherChargers.map(item => item.userId)

        await this.getMediaOptions(false)

        // 媒体层级 媒体位置
        await this.showMediaInfo(this.formData.mediaId) // 媒体ID

        // 媒体板块
        await this.getMediaBlockOptions()

        // 媒体板块信息
        await this.getMediaInfo(this.formData.id)

        this.loading.close()
      }
    },
    // 返回板块信息
    async getMediaInfo(personId) {
      if (!personId) {
        return
      }
      const { data } = await getMediaInfo(personId)
      this.mediaBlockIds = data.mediaBlockInfos.map(item => item.id)
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

      const { code, msg} = await saveOrUpdate({
        person: this.formData,
        otherChargers,
        personBlocks
      });
      if (code == '0') {
        this.disableSave = true
        this.$message.success('保存成功')
        setTimeout(this.cancel, 3000)
      } else {
        this.$message.error(msg)
      }
      this.loading.close()
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
        margin-bottom: 20px;
        padding: 5px 20px;
        line-height: 25px;
        font-size: 14px;
        font-weight: 600;
        color: #000;
        background-color: #f1f2f3;
        border: solid 1px #d2d8e4;
    }
    .hd i {
        color: #2a68c9;
    }
    .commonForm{
      margin: 0 auto;
      width: 70%;
    }
    .tips {
        margin-top: 10px;
        line-height: 24px;
        font-size: 12px;
        color: #f00;
    }
    .footer{
      padding: 20px 0;
      border-top: solid 1px #d2d8e4;
      text-align: center;
    }
    .footer >>> .el-button{
      margin:0 60px;
    }
</style>
