<template>
    <el-cascader
      placeholder="媒体位置"
      :options="options"
      :props="props"
      clearable
      separator=">"
      filterable
      v-model="mediaPosition"
      class="filter-item"
      style="width:240px;"
      @change="positionChange"
    >
    </el-cascader>
</template>
<script>
import AreaInfoAPI from '@/api/areaInfo'
export default {
  name: 'MediaPosition',
  data() {
    return {
      props: {
        lazy: true,
        checkStrictly: true,
        lazyLoad: this.lazyLoad
      },
      mediaPosition:['','',''],
      options:[{label:"国内", value: 1},{label:"国外", value: 2}],
    }
  },
  methods: {
    positionChange(){
      this.$emit('positionChange', {
        positionRange: typeof(this.mediaPosition[0]) !== "undefined" ? this.mediaPosition[0] : '',
        positionParentId: typeof(this.mediaPosition[1]) !== "undefined" ? this.mediaPosition[1] : '',
        positionId: typeof(this.mediaPosition[2]) !== "undefined" ? this.mediaPosition[2] : '',
      })
    },
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
