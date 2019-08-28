<template>
  <el-form-item :label="label" :required="required">
    <el-select v-model="pr" placeholder="请选择" clearable :style="selectStyle" @change="rangeChange">
      <el-option label="国内" value="1" />
      <el-option label="国外" value="2" />
    </el-select>
    <el-select v-model="pid" placeholder="省/国家" filterable clearable :style="selectStyle" @change="parentChange">
      <el-option v-for="p in positionParentOptions" :key="p.id" :label="p.name" :value="p.id" />
    </el-select>
    <el-select v-model="id" placeholder="市" filterable clearable :style="selectStyle" @change="positionChange">
      <el-option v-for="p in positionOptions" :key="p.id" :label="p.name" :value="p.id" />
    </el-select>
  </el-form-item>
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
      pr: this.positionRange,
      pid: this.positionParentId,
      id: this.positionId,
      positionParentOptions: [],
      positionOptions: [],
      loadingParent: false,
      tryTimes: 0
    }
  },
  watch: {
    positionRange(val) {
      this.pr = val
      this.getPositionParentOptions(false)
    },
    positionParentId(val) {
      this.pid = val
      if (this.loadingParent) {
        setTimeout(() => {
          this.getPositionOptions(false)
        }, 500)
      } else {
        this.getPositionOptions(false)
      }
    },
    positionId(val) {
      this.id = val
    }
  },
  created() {
    this.getPositionParentOptions()
  },
  methods: {
    rangeChange() {
      this.getPositionParentOptions()
      this.$emit('range-change', this.pr)
    },
    parentChange() {
      this.getPositionOptions()
      this.$emit('parent-change', this.pid)
    },
    positionChange() {
      this.$emit('position-change', this.id)
    },
    getPositionParentOptions(clear = true) {
      this.loadingParent = true
      if (clear) {
        this.pid = null
        this.id = null
        this.positionOptions = []
      }
      if (this.pr == 1) {
        AreaInfoAPI.geAreaList({ level: 1 }).then(res => {
          this.loadingParent = false
          this.positionParentOptions = res.data
        }).catch(err => {
          this.loadingParent = false
        })
      } else {
        AreaInfoAPI.getForeignAreaList({ parentId: 0 }).then(res => {
          this.loadingParent = false
          this.positionParentOptions = res.data
        }).catch(err => {
          this.loadingParent = false
        })
      }
    },
    getPositionOptions(clear = true) {
      /* if (this.loadingParent) {
                    if (this.tryTimes < 3) {
                        setTimeout(() => {
                            this.getPositionOptions(clear);
                        }, 200)
                        this.tryTimes++;
                    }
                    return;
                }
                this.tryTimes = 0;*/
      if (clear) {
        this.id = null
        this.positionOptions = []
      }
      const parent_id = this.pid
      if (this.pr == 1) {
        const index = this.positionParentOptions.findIndex(item => item.id == parent_id)
        const code = this.positionParentOptions[index].code
        AreaInfoAPI.geAreaList({ parent_code: code }).then(res => {
          this.positionOptions = res.data
        })
      } else {
        AreaInfoAPI.getForeignAreaList({ parentId: parent_id }).then(res => {
          this.positionOptions = res.data
        })
      }
    }
  }
}
</script>
