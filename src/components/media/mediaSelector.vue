<template>
  <span>
    <el-select v-if="showStore" placeholder="层级" class="filter-item" v-model="storey" @change="storeChange">
      <el-option label="全部" value="" />
      <el-option v-for="m in mediaStoreOptions" :key="m.value" :label="m.name" :value="m.value" />
    </el-select>

    <!-- <el-form-item label="媒体：">
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
    </el-form-item> -->
    <el-cascader
      placeholder="媒体类型>媒体>板块"
      :options="options"
      :props="props"
      clearable
      separator=">"
      :value="mediaValue"
      class="filter-item"
      style="width:240px;"
    >
    </el-cascader>
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
      storey: '',   //层级
      mediaType: '',
      mediaId: '',
      mediaBlockId: '',
      mediaStoreOptions: MediaAPI.getMediaStores(),
      mediaTypeOptions: MediaAPI.getMediaTypes(),
      mediaOptions: [],
      mediaBlockOptions: [],
      mediaValue: "",
      props: {
        lazy: true,
        checkStrictly: true,
        lazyLoad: this.lazyLoad
      },
      options:[],
    }
  },
  created() {
    this.options = this.mediaTypeOptions.map((item, index)=>{return {value: item.value,label: item.name,storey: this.storey}});
  },
  methods: {
    lazyLoad(node, resolve) {
      const { level } = node;
      console.log("node:",node,"level:",level);
      if(1=== level){
        MediaAPI.mediaPager({   // 通过 层级 + 媒体类型获取第二级数据
          storey: this.storey,  // 层级
          media_type: node.value  //媒体类型 
        }).then(res => {
          let nodes = res.data.records.map((item, inde)=>{
            return {
              ...item,
              label: item.name,
              value: item.id
            }
          })
          resolve(nodes);
        })
      }if(2=== level){
        MediaAPI.mediaBlockPager({
          media_id: node.value
        }).then(res => {
          let nodes = res.data.records.map((item, inde)=>{
            return {
              ...item,
              label: item.name,
              value: item.id,
              leaf: true,
            }
          })
          resolve(nodes);
        })
      }
    },
    storeChange() {
      this.options = this.mediaTypeOptions.map((item, index)=>{return {value: item.value,label: item.name,storey: this.storey}});
    },

  }
}
</script>

