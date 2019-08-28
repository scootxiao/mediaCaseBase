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
        <div class="tree-bd" :style="treeBoxObj">
          <el-tree
            ref="personalMediaTree"
            class="filter-tree"
            :data="personalMediaTreeData"
            :props="defaultProps"
            node-key="nodeKey"
            default-expand-all
            show-checkbox
            :default-checked-keys="default_checked_keys"
          />
        </div>
      </div>
      <el-form class="commonForm" :model="formData" label-width="100px">
        <el-form-item label="标题：">
          {{ formData.title }}
        </el-form-item>
        <el-form-item label="通知对象：">
          <span v-if="formData.notifyFlag == 0">所有媒体人</span>
          <span v-else>选择媒体人</span>
        </el-form-item>
        <el-form-item label="通知方式：">
          <span v-if="formData.smsStatus == 1">短信</span>
          <span v-if="formData.emailStatus == 1">  邮件</span>
        </el-form-item>
        <el-form-item v-show="formData.emailStatus == 1" label="邮件通知：">
          <quill-editor
            ref="myQuillEditor"
            v-model="formData.emailContent"
            :options="editorOption"
            placeholder="请输入内容"
            readonly
          />
        </el-form-item>
        <el-form-item label="短信通知：">
          <el-input
            v-show="formData.smsStatus == 1"
            v-model="formData.smsContent"
            type="textarea"
            rows="8"
            maxlength="70"
            readonly
            show-word-limit
          />
          <span class="tips">短信通知：请遵守短信公约，您可输入70字</span>
        </el-form-item>
      </el-form>
      <div class="common-btns">
        <el-button type="primary">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import MediaAPI from '@/api/mediaSettings'
import request from '@/util/request'
export default {
  name: 'MediaNoticeCheck',
  data() {
    return {
      formData: {},
      personalMediaTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        disabled: this.disabledFn
      },
      default_checked_keys: [],
      editorOption: {
        theme: 'snow'
      },
      treeBoxObj: {
        height: '320px'
      }
    }
  },
  computed: {
  },
  mounted() {
    this.treeBoxObj.height = this.$refs.tree_warper.scrollHeight - 160 + 'px'
  },
  created() {
    this.getPersonalMediaTreeData()
    this.initMediaNotice()
  },
  methods: {
    getPersonalMediaTreeData() {
      MediaAPI.getMediaPersonTree({}).then(res => {
        this.personalMediaTreeData = res.data
      })

      // let checkedNodes = this.$refs.personalMediaTree.getCheckedNodes();
    },
    initMediaNotice() {
      const id = this.$route.query.id
      request({
        'url': '/media_repository/mediaNotice/getMediaNoticeById?id=' + id,
        method: 'get'
      }).then(res => {
        try {
          if (res.code == '0') {
            this.formData = res.data.media_notice
            if (this.formData.notifyFlag == 0) {
              this.$refs.personalMediaTree.setCheckedNodes(this.personalMediaTreeData)
            } else {
              res.data.notice_person_ids.forEach(item => {
                this.default_checked_keys.push('PERSON' + item)
              })
            }
          }
        } catch (e) {
          console.log(e)
        }
      }).catch(err => {
        this.$message({
          'type': 'error',
          'message': err.msg
        })
      })
    },
    disabledFn() {
      return true
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
