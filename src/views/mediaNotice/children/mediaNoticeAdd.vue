<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="-">
        <el-breadcrumb-item><i class="iconfont icon-shouye" /> 媒体通知</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div ref="tree_warper" class="tree-warper">
        <div class="tree-hd">
          媒体人列表
        </div>
        <div class="tree-bd">
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"
          />
          <div class="tree-box" :style="treeBoxObj">
            <el-tree
              ref="personalMediaTree"
              class="filter-tree"
              :data="personalMediaTreeData"
              :props="defaultProps"
              node-key="nodeKey"
              default-expand-all
              show-checkbox
              :filter-node-method="filterNode"
            />
          </div>
        </div>
      </div>
      <el-form class="commonForm" :model="formData" label-width="100px">
        <el-form-item label="标题：">
          <el-input v-model="formData.title" placeholder="请输入标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="通知对象：">
          <el-radio-group v-model="notify_flag">
            <el-radio label="0">所有媒体人</el-radio>
            <el-radio label="1">选择媒体人</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="通知方式：">
          <el-radio-group>
            <el-checkbox v-model="formData.email_status" label="邮件" />
            <el-checkbox v-model="formData.sms_status" label="短信" />
          </el-radio-group>
        </el-form-item>

        <el-form-item v-show="formData.email_status" label="邮件通知：">
          <!-- <el-input type="textarea" rows="8" v-model="formData.emailContent"></el-input> -->
          <quill-editor
            ref="myQuillEditor"
            v-model="formData.emailContent"
            :options="editorOption"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="短信通知：">
          <el-input
            v-model="formData.smsContent"
            type="textarea"
            rows="8"
            maxlength="70"
            show-word-limit
          />
          <span class="tips">短信通知：请遵守短信公约，您可输入70字</span>
        </el-form-item>
      </el-form>
      <div class="common-btns">
        <el-button type="primary" @click="sendMediaNotice">发送</el-button>
        <el-button>取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings'
import request from '@/util/request'
export default {
  name: 'MediaNoticeAdd',
  data() {
    return {
      formData: {
      },
      personalMediaTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      notify_flag: '1',
      loading: null,
      filterText: '',
      editorOption: {
        theme: 'snow'
        /* modules:{
                    toolbar:[
                      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                      ['blockquote', 'code-block']
                    ]
                }*/
      },
      treeBoxObj: {
        height: '320px'
      }
    }
  },
  computed: {
  },
  watch: {
    notify_flag(newValue, oldValue) {
      if (newValue == '1') {
        this.$refs.personalMediaTree.setCheckedNodes([])
      } else {
        this.$refs.personalMediaTree.setCheckedNodes(this.personalMediaTreeData)
      }
    },
    filterText(val) {
      this.$refs.personalMediaTree.filter(val)
    }
  },
  created() {
    this.getPersonalMediaTreeData()
  },
  mounted() {
    this.treeBoxObj.height = this.$refs.tree_warper.scrollHeight - 160 + 'px'
  },
  methods: {
    getPersonalMediaTreeData() {
      MediaAPI.getMediaPersonTree({}).then(res => {
        this.personalMediaTreeData = res.data
      })

      // let checkedNodes = this.$refs.personalMediaTree.getCheckedNodes();
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    sendMediaNotice() {
      let mediaPersonIds = []
      const checkedNodes = this.$refs.personalMediaTree.getCheckedNodes()
      checkedNodes.forEach(item => {
        if (item.typeId != null) {
          mediaPersonIds.push(item.id)
        }
      })

      if (this.notify_flag == '1' && mediaPersonIds.length == 0) {
        this.$message({
          type: 'error',
          message: '请选择通知对象'
        })
        return
      }

      if (this.notify_flag == '0') { // 通知对象为所有媒体人  去掉所选媒体人参数
        mediaPersonIds = []
      }

      this.showLoading('发送中，请稍候...')
      const params = this.formData
      params.smsStatus = params.sms_status ? 1 : 0
      params.emailStatus = params.email_status ? 1 : 0
      params.notifyFlag = this.notify_flag

      const dto = {
        mediaNotice: params,
        mediaPersonIds: mediaPersonIds
      }

      request({
        url: '/media_repository/mediaNotice/sendMediaNotice',
        method: 'post',
        data: dto
      }).then(res => {
        this.loading.close()
        if (res.code == '0') {
          this.$message({
            type: 'success',
            message: '发送成功'
          })
          setTimeout(() => {
            /* window.opener = null;
                      window.open("about:blank", "_top").close()*/
            this.cancel
          }, 3000)
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      }).catch(err => {
        this.loading.close()
        this.$message({
          'type': 'error',
          'message': err.msg
        })
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
  *{
    box-sizing: border-box;
  }

  .container{
    padding-left: 200px;
  }

  .content-box .content .common-btns{
    width: auto;
    right:0;
    left: 200px;
  }

  .tree-warper{
    position: absolute;
    top: 40px;
    bottom: 0px;
    left: 0;
    width: 200px;
    border-right: solid 1px #d2d8e4;
  }

  .tree-hd{
    padding: 10px 5px;
    width: 100%;
    height: 48px;
    line-height: 28px;
    font-size: 16px;
    font-weight: 600;
    color: #000;
    background-color: #f1f2f3;
  }

  .tree-bd{
    position: absolute;
    top: 62px;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
  }

  .wrapper .commonForm{
    width: 70%;
  }

  .tips{
    margin-top:20px;
    font-size: 12px;
    color: #f00;
  }

  .tree-box{
    margin-top: 5px;
    overflow: auto;
  }
</style>
