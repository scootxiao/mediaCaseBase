<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 系统设置</el-breadcrumb-item>
        <el-breadcrumb-item>消息推送设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-tabs v-model="set_notice_type" class="tab" type="border-card" @tab-click="tabPaneSwitch">
        <el-tab-pane label="修改通知" name="0">
          <el-form :model="editForm" label-width="100px">
            <el-form-item label="弹窗推送:">
              <el-switch v-model="editForm.sysFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="邮件推送:">
              <el-switch v-model="editForm.emailFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item v-show="false" label="推送模式:">
              <el-radio-group v-model="editForm.pushType">
                <el-radio :label="0">实时推送</el-radio>
                <el-radio :label="1">定时推送</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-show="false" label="每日:"><!-- 去除定时提醒功能 <el-form-item label="每日:" v-show="editForm.pushType == 1"> -->
              <el-time-picker
                v-model="editForm.push_time"
                format="HH:mm"
                value-format="HH:mm"
                is-range
                placeholder="推送时段"
              />
              <!-- :picker-options="{
                      selectableRange: '18:30:00 - 20:30:00'
                    }" -->
            </el-form-item>
            <el-form-item>
              <el-button class="btn" size="small" @click="saveOrUpdatePushSet">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="删除通知" name="1">
          <el-form :model="editForm" label-width="100px">
            <el-form-item label="弹窗推送:">
              <el-switch v-model="editForm.sysFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="邮件推送:">
              <el-switch v-model="editForm.emailFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item v-show="false" label="推送模式:">
              <el-radio-group v-model="editForm.pushType">
                <el-radio :label="0">实时推送</el-radio>
                <el-radio :label="1">定时推送</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-show="false" label="每日:"><!-- 去除定时提醒功能 <el-form-item label="每日:" v-show="editForm.pushType == 1"> -->
              <el-time-picker
                v-model="editForm.push_time"
                format="HH:mm"
                value-format="HH:mm"
                is-range
                placeholder="推送时段"
              />
              <!-- :picker-options="{
                      selectableRange: '18:30:00 - 20:30:00'
                    }" -->
            </el-form-item>
            <el-form-item>
              <el-button class="btn" size="small" @click="saveOrUpdatePushSet">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="接收通知" name="2">
          <el-form :model="editForm" label-width="100px">
            <el-form-item label="弹窗推送:">
              <el-switch v-model="editForm.sysFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="邮件推送:">
              <el-switch v-model="editForm.emailFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item v-show="false" label="推送模式:">
              <el-radio-group v-model="editForm.pushType">
                <el-radio :label="0">实时推送</el-radio>
                <el-radio :label="1">定时推送</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-show="false" label="每日:"><!-- 去除定时提醒功能 <el-form-item label="每日:" v-show="editForm.pushType == 1"> -->
              <el-time-picker
                v-model="editForm.push_time"
                format="HH:mm"
                value-format="HH:mm"
                is-range
                placeholder="推送时段"
              />
              <!-- :picker-options="{
                      selectableRange: '18:30:00 - 20:30:00'
                    }" -->
            </el-form-item>
            <el-form-item>
              <el-button class="btn" size="small" @click="saveOrUpdatePushSet">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import axios from '@/util/request'
import loading from '@/util/loading'
export default {
  name: 'PushNotifications',
  data() {
    return {
      editForm: {
      },
      defaultEditForm: {
        sysFlag: 1,
        emailFlag: 1,
        pushType: 0,
        push_time: ['09:00', '09:00']
      },
      set_notice_type: '0',
      push_set_data: {}
    }
  },
  computed: {
  },
  created() {
    this.loadPushSetData()
  },
  methods: {
    tabPaneSwitch() {
      const push_set = this.push_set_data[this.set_notice_type]
      if (push_set) {
        this.editForm = push_set
      } else {
        this.editForm = this.defaultEditForm
      }
    },
    loadPushSetData() {
      loading.showLoading('正在加载配置...')
      axios.post('/media_repository/pushSet/findPushSet', {}).then(res => {
        loading.close()

        if (res.code == '0' && res.data) {
          res.data.forEach(item => {
            if (item.pushType == 1) {
              item.push_time = [item.beginPushTime, item.endPushTime]
            } else {
              item.push_time = ['09:00', '09:00']
            }
            this.push_set_data[item.type + ''] = item
          })
        }
        console.log(this.push_set_data)
        this.tabPaneSwitch()
      }).catch(error => {
        console.log(error)
        loading.close()
      })
    },
    saveOrUpdatePushSet() {
      loading.showLoading('正在保存中...')
      let push_set = this.editForm
      push_set.type = this.set_notice_type
      if (push_set.pushType == 1) {
        push_set.beginPushTime = push_set.push_time[0]
        push_set.endPushTime = push_set.push_time[1]
      }

      axios.post('/media_repository/pushSet/saveOrUpdatePushSet', push_set).then(res => {
        loading.close()
        if (res.code == '0') {
          this.$message({
            type: 'success',
            message: '保存成功'
          })
          push_set = res.data
          if (push_set.pushType == 1) {
            push_set.push_time = [push_set.beginPushTime, push_set.endPushTime]
          } else {
            push_set.push_time = ['09:00', '09:00']
          }
          this.push_set_data[push_set.type + ''] = push_set
          this.editForm = push_set
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      }).catch(error => {
        console.log(error)
        loading.close()
      })
    }
  }
}
</script>

<style scoped>
  *{
    box-sizing: border-box;
  }

  .tab{
    margin: 20px;
  }

  .btn{
    padding: 8px 15px !important;
  }

</style>
