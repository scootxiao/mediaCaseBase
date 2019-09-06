<template>
  <div class="app-container">
    <div class="container-hd">
      <span class="name">
        {{ mediaInfo.name }}
        <template v-if="mediaBlockInfos.length > 0"> - {{ mediaBlockInfos | mediaBlockInfoFT }}</template>
        <el-image
          :src="logoUrl"
          fit="fill"
          class="mediaInfoIcon"
        >
          <div slot="placeholder" class="image-slot">
            暂无图片<span class="dot">...</span>
          </div>
        </el-image>
      </span>
      <span class="msg">
        最新更新时间：{{ person.updateAt }}
        <span>操作人员：{{ person.updateByName }}</span>
      </span>
    </div>
    <el-row>
      <el-col :span="12" style="border-right:1px solid #aaa;">
        <div class="hd">
          <i class="el-icon-menu" /> 媒体信息
        </div>
        <el-form class="commonForm" label-width="120px">
          <el-form-item label="媒体类型：">
            {{ mediaInfo.mediaType | mediaTypeFT }}
          </el-form-item>
          <el-form-item label="媒体：">
            {{ mediaInfo.name }}
          </el-form-item>
          <el-form-item label="媒体层级：">
            {{ mediaInfo.storey | mediaStoreyFT }}
          </el-form-item>
          <el-form-item label="媒体位置：">
            {{ placeInfo }}
          </el-form-item>
          <el-form-item label="媒体人姓名：">
            {{ person.name }}
          </el-form-item>
          <el-form-item label="媒体人职务：">
            {{ person.job }}
          </el-form-item>
          <el-form-item label="合作亲密度：">
            {{ person.relation | relationFT }}
          </el-form-item>
          <el-form-item label="手机号码：">
            {{ person.phone | emptyFT }}
          </el-form-item>
          <el-form-item label="负责板块：">
            {{ mediaBlockInfos | mediaBlockInfoFT }}
          </el-form-item>
          <el-form-item label="邮箱：">
            {{ person.email | emptyFT }}
          </el-form-item>
          <el-form-item label="座机：">
            {{ person.landline | emptyFT }}
          </el-form-item>
          <el-form-item label="QQ：">
            {{ person.qqNum | emptyFT }}
          </el-form-item>
          <el-form-item label="微信：">
            {{ person.wxNum | emptyFT }}
          </el-form-item>
          <el-form-item label="微博：">
            {{ person.weibo | emptyFT }}
          </el-form-item>
          <el-form-item label="办公地点：">
            {{ person.workPlace | emptyFT }}
          </el-form-item>
          <el-form-item label="生日：">
            {{ person.birthday | emptyFT }}
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <div class="hd">
          <i class="el-icon-menu" /> 负责/维护人员
        </div>
        <el-form class="commonForm" label-width="120px">
          <el-form-item label="负责人：">
            {{ person.chargeByName }}
          </el-form-item>
          <el-form-item label="负责部门：">
            {{ person.chargeByDeptName }}
          </el-form-item>
          <el-form-item label="职务：">
            {{ person.chargeByPosition }}
          </el-form-item>
          <el-form-item label="其他维护人：">
            {{ otherChargers | otherChargersFT }}
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import MediaAPI from '@/api/mediaSettings.js'
import { getDetail, getMediaInfo, getPositionInfo } from '@/api/mediaMsg'
export default {
  name: 'MediaMsgCheck',
  filters: {
    mediaTypeFT(val) {
      return MediaAPI.parseMediaType(val)
    },
    mediaStoreyFT(val) {
      return MediaAPI.parseMediaStore(val)
    },
    relationFT(val) {
      return ['一般', '亲密'][val] || ''
    },
    emptyFT(val) {
      return val || '-- -- -- --'
    },
    otherChargersFT(val) {
      return val.map(item => item.userName).join('，')
    },
    mediaBlockInfoFT(val) {
      return val.map(item => item.name).join('，')
    }
  },
  data() {
    return {
      person: {},
      otherChargers: [],
      mediaInfo: {},
      mediaBlockInfos: [],
      positionInfo: [],
      logoUrl: ''
    }
  },
  computed: {
    placeInfo() {
      const range = ['', '国内', '国外'][this.mediaInfo.positionRange] || ''
      return [range, this.positionInfo.positionParentName, this.positionInfo.positionName].join(' ')
    }
  },
  watch: {
    'person.id': function(val) {
      if (val) {
        this.getMediaInfo(val)
      }
    },
    'person.mediaId': function(val) {
      if (val) {
        this.getPositionInfo(val)
      }
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    getDetail() {
      if (!this.$route.query.id) {
        this.$message.error('ID不能为空')
        return
      }
      this.showLoading('加载中，请稍候...')
      getDetail(this.$route.query.id)
        .then(res => {
          this.loading.close()
          this.person = res.data.person
          this.otherChargers = res.data.otherChargers
        })
        .catch(err => {
          this.loading.close()
        })
    },
    getMediaInfo(persionId) {
      getMediaInfo(persionId)
        .then(res => {
          this.mediaInfo = res.data.mediaInfo
          this.mediaBlockInfos = res.data.mediaBlockInfos
          this.logoUrl = res.data.file_data
        })
    },
    getPositionInfo(mediaId) {
      getPositionInfo(mediaId)
        .then(res => {
          this.positionInfo = res.data
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

    .container-hd {
        padding: 5px 0;
        line-height: 32px;
        font-size: 0;
    }

    .container-hd .name {
        margin-right: 20px;
        font-size: 18px;
        font-weight: 600;
    }

    .mediaInfoIcon{
      width: 28px;
      height: 28px;
      vertical-align: middle;
      border-radius: 3px;
    }

    .container-hd .msg {
        padding-left: 20px;
        font-size: 12px;
        color: #666;
        float: right;
    }

    .container-hd .msg span{
      padding: 0 20px;
    }

    .hd {
        padding: 5px 20px;
        line-height: 25px;
        font-size: 14px;
        font-weight: 600;
        color: #000;
        background-color: #f1f2f3;
        border-top: solid 1px #d2d8e4;
        border-bottom: solid 1px #d2d8e4;
    }

    .hd i {
        color: #2a68c9;
    }

</style>
