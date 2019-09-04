<template>
  <span>
    <el-select placeholder="层级" class="filter-item" v-model="storey" @change="storeChange">
      <el-option label="全部" value="" />
      <el-option v-for="m in mediaStoreOptions" :key="m.value" :label="m.name" :value="m.value" />
    </el-select>
    <el-cascader
      placeholder="媒体类型>媒体>板块"
      :options="options"
      :props="props"
      clearable
      separator=">"
      v-model="mediaValue"
      class="filter-item"
      style="width:240px;"
      @change="mediaChange"
    >
    </el-cascader>
  </span>
</template>
<script>
import MediaAPI from '@/api/mediaSettings'
export default {
  name: 'MediaSelector',
  data() {
    return {
      storey: '',   //层级
      mediaStoreOptions: MediaAPI.getMediaStores(), //层级分类
      mediaTypeOptions: MediaAPI.getMediaTypes(),   //媒体类型分类
      mediaValue: ['','',''],
      props: {
        lazy: true,
        checkStrictly: true,
        lazyLoad: this.lazyLoad
      },
      options:[],
    }
  },
  created() {
    this.optionsInit();
  },
  methods: {
    optionsInit(){
      this.options = this.mediaTypeOptions.map((item, index)=>{return {value: item.value,label: item.name,storey: this.storey}});
      this.mediaValue = ['','',''];
    },
    lazyLoad(node, resolve) {
      const { level } = node;
      console.log("node:",node,"level:",level);
      if(1=== level){
        MediaAPI.mediaPager({   // 通过 层级 + 媒体类型获取第二级数据
          storey: this.storey,  // 层级
          media_type: node.value  //媒体类型 
        }).then(res => {
          resolve(this.createNodes(res.data.records));
        })
      }if(2=== level){
        MediaAPI.mediaBlockPager({
          media_id: node.value
        }).then(res => {
          resolve(this.createNodes(res.data.records,{leaf:true}));
        })
      }
    },
    storeChange() {
      this.optionsInit();
      this.mediaChange();
    },
    mediaChange(){
      this.$emit('mediaChange', {
        storey: this.storey,
        mediaType: typeof(this.mediaValue[0]) !== "undefined" ? this.mediaValue[0] : '',
        mediaId: typeof(this.mediaValue[1]) !== "undefined" ? this.mediaValue[1] : '',
        mediaBlockId: typeof(this.mediaValue[2]) !== "undefined" ? this.mediaValue[2] : '',
      })
    },
    createNodes(value, curObj){
      let newNodes = value.map((item, index)=>{
            return {
              ...item,
              label: item.name,
              value: item.id,
              ...curObj
            }
          })
      return newNodes;
    }
  }
}
</script>

