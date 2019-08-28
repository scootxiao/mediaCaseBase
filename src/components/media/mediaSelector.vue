<template>
  <span>
    <el-form-item v-if="showStore" label="层级：">
      <el-select v-model="storey" @change="storeChange">
        <el-option label="全部" value="" />
        <el-option v-for="m in mediaStoreOptions" :key="m.value" :label="m.name" :value="m.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="媒体：">
      <el-select v-if="showType" v-model="mediaType" @change="typeChange">
        <el-option label="全部类型" value="" />
        <el-option v-for="m in mediaTypeOptions" :key="m.value" :label="m.name" :value="m.value" />
      </el-select>
      <el-select v-model="mediaId" @change="mediaChange">
        <el-option label="全部媒体" value="" />
        <el-option v-for="m in mediaOptions" :key="m.id" :label="m.name" :value="m.id" />
      </el-select>
      <el-select v-if="showBlock" v-model="mediaBlockId" @change="blockChange">
        <el-option label="全部版块" value="" />
        <el-option v-for="m in mediaBlockOptions" :key="m.id" :label="m.name" :value="m.id" />
      </el-select>
    </el-form-item>
  </span>
</template>
<script>
import MediaAPI from '@/api/mediaSettings'
export default {
  name: 'MediaSelector',
  props: {
    showStore: {
      type: Boolean,
      default: true
    },
    showType: {
      type: Boolean,
      default: true
    },
    showBlock: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      storey: '',
      mediaType: '',
      mediaId: '',
      mediaBlockId: '',
      mediaStoreOptions: MediaAPI.getMediaStores(),
      mediaTypeOptions: MediaAPI.getMediaTypes(),
      mediaOptions: [],
      mediaBlockOptions: []
    }
  },
  created() {
    this.getMediaOptions()
  },
  methods: {
    storeChange() {
      this.getMediaOptions()
      this.$emit('store-change', this.storey)
    },
    typeChange() {
      this.getMediaOptions()
      this.$emit('type-change', this.mediaType)
    },
    mediaChange() {
      if (this.showBlock) {
        this.getMediaBlockOptions()
      }
      this.$emit('media-change', this.mediaId)
    },
    blockChange() {
      this.$emit('block-change', this.mediaBlockId)
    },
    getMediaOptions() {
      this.mediaId = ''
      this.mediaBlockId = ''
      MediaAPI.mediaPager({
        storey: this.storey,
        media_type: this.mediaType
      }).then(res => {
        this.mediaOptions = res.data.records
      })
    },
    getMediaBlockOptions() {
      this.mediaBlockId = ''
      MediaAPI.mediaBlockPager({
        media_id: this.mediaId
      }).then(res => {
        this.mediaBlockOptions = res.data.records
      })
    }
  }
}
</script>
<style scoped>

</style>
