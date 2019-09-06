<template>
  <span>
    <el-select v-model="storey" placeholder="层级" class="filter-item" @change="storeChange">
      <el-option label="全部" value="" />
      <el-option v-for="m in mediaStoreOptions" :key="m.value" :label="m.name" :value="m.value" />
    </el-select>
    <el-cascader
      v-model="mediaValue"
      placeholder="媒体类型>媒体>板块"
      :options="options"
      :props="props"
      clearable
      separator=">"
      class="filter-item"
      style="width:240px;"
      @change="mediaChange"
    />
  </span>
</template>
<script>
import MediaAPI from '@/api/mediaSettings'
export default {
  name: 'MediaSelector',
  data() {
    return {
      storey: '', // 层级
      mediaStoreOptions: MediaAPI.getMediaStores(), // 层级分类
      mediaValue: ['', '', ''],
      props: {
        lazy: true,
        checkStrictly: true,
        lazyLoad: this.lazyLoad
      },
      options: []
    }
  },
  created() {
    this.optionsInit()
  },
  methods: {
    optionsInit() {
      this.options = MediaAPI.getMediaTypes().map((item, index) => { return { value: item.value, label: item.name, storey: this.storey } })
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
    storeChange() {
      this.optionsInit()
      this.mediaChange()
    },
    mediaChange() {
      this.$emit('mediaChange', {
        storey: this.storey,
        mediaType: typeof (this.mediaValue[0]) !== 'undefined' ? this.mediaValue[0] : '',
        mediaId: typeof (this.mediaValue[1]) !== 'undefined' ? this.mediaValue[1] : '',
        mediaBlockId: typeof (this.mediaValue[2]) !== 'undefined' ? this.mediaValue[2] : ''
      })
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
    }
  }
}
</script>

