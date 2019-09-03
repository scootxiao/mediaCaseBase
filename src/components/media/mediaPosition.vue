<template>
    <!-- <el-select 
      v-model="pr" 
      placeholder="请选择" 
      clearable 
      :style="selectStyle" 
      @change="rangeChange"
    >
      <el-option label="国内" value="1" />
      <el-option label="国外" value="2" />
    </el-select>
    <el-select 
      v-model="pid" 
      placeholder="省/国家" 
      filterable clearable 
      :style="selectStyle" 
      @change="parentChange"
    >
      <el-option v-for="p in positionParentOptions" :key="p.id" :label="p.name" :value="p.id" />
    </el-select>
    <el-select 
      v-model="id" 
      placeholder="市" 
      filterable 
      clearable 
      :style="selectStyle" 
      @change="positionChange"
    >
      <el-option v-for="p in positionOptions" :key="p.id" :label="p.name" :value="p.id" />
    </el-select> -->
    <el-cascader
      placeholder="媒体位置"
      :options="options"
      :props="props"
      clearable
      separator=">"
      filterable
      class="filter-item"
      style="width:240px;"
    >
    </el-cascader>
</template>
<script>
import AreaInfoAPI from '@/api/areaInfo'
export default {
  name: 'MediaPosition',
  props: {
    label: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    selectStyle: {
      type: String,
      default: ''
    },
    positionRange: {
      type: String,
      default: '1'
    },
    positionParentId: {
      type: [Number, String]
    },
    positionId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      // pr: this.positionRange,
      // pid: this.positionParentId,
      // id: this.positionId,
      // positionParentOptions: [],
      // positionOptions: [],
      // loadingParent: false,
      // tryTimes: 0,
      props: {
        lazy: true,
        checkStrictly: true,
        lazyLoad: this.lazyLoad
      },
      options:[{label:"国内", value: 1},{label:"国外", value: 2}],
    }
  },
  methods: {
    lazyLoad(node, resolve) {
      const { level } = node;
      if( 1 === level ){
        if (node.value === 1) { //国内
          AreaInfoAPI.geAreaList({ level: 1 }).then(res => {
            resolve( this.createNodes(res.data, {inland:true}) )
          })
        } else { //国外
          AreaInfoAPI.getForeignAreaList({ parentId: 0 }).then(res => {
            console.log("res.data:",res.data);
            resolve( this.createNodes(res.data, {inland:false}) )
          })
        }
      }if( 2 === level ){
        if ( node.data.inland ) { //国内
          AreaInfoAPI.geAreaList({ parent_code: node.data.code }).then(res => {
            resolve( this.createNodes(res.data, {leaf:true}) )
          })
        } else { //国外
          AreaInfoAPI.getForeignAreaList({ parentId: node.data.id }).then(res => {
            resolve( this.createNodes(res.data, {leaf:true}) )
          })
        }
      }
    },
    createNodes(value, curObj){
      let newNodes = value.map((item, index)=>{
            return{
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
