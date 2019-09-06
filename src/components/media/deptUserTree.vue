<template>
  <div>
    <div class="dialog-box">
      <div class="tree-warper" style="width:49%;">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
        />
        <div class="tree-box">
          <el-tree
            :ref="ref"
            class="filter-tree"
            :data="treeNode"
            :props="props"
            node-key="id"
            show-checkbox
            default-expand-all
            :filter-node-method="filterNode"
            @check-change="checkChange"
          />
        </div>
      </div>
      <div class="list-warper" style="margin-left:2%;width:49%;">
        <div v-for="(item,index) in selectedData" class="list-item">
          {{ item[props.label] }}
          <el-button class="btn" type="text" icon="el-icon-close" @click="removeCheck(item.id, index)" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DeptUserTree',
  props: {
    treeData: {
      type: Array,
      default() {
        return []
      }
    },
    props: {
      type: Object,
      default() {
        return {
          label: 'username',
          children: 'userList'
        }
      }
    },
    selectedData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      ref: 'deptUserTree',
      filterText: '',
      selection: [],
      treeNode: []
    }
  },
  watch: {
    filterText(val) {
      this.$refs[this.ref].filter(val)
    },
    selectedData(val) {
      this.selection = this.selectedData
      this.$refs[this.ref].setCheckedNodes = val
    },
    treeData: {
      handler(val) {
        this.preData(val)
      },
      deep: true
    }
  },
  created() {
    this.$nextTick(() => {
      if (this.treeNode || this.treeNode.length < 1) {
        this.preData(this.treeData)
      }
    })
  },
  methods: {
    checkChange() {
      this.selection = this.$refs[this.ref].getCheckedNodes(true) || []
      this.$emit('change', this.selection)
    },
    removeCheck(id, index) {
      this.$refs[this.ref].setChecked(id, false)
      this.selection.splice(index, 1)
    },
    filterNode(value, data) {
      if (!value) return true
      return data[this.props.label].indexOf(value) !== -1
    },
    preData(val) {
      const data = []
      const parentNodes = {}
      val.forEach(item => {
        const children = item[this.props.children]
        if (!children || children.length < 1) {
          data.push(item)
          return
        }
        children.forEach(ch => {
          if (parentNodes[item.id + '']) {
            ch.parentNode = parentNodes[item.id + '']
          } else {
            ch.parentNode = {}
            for (const k in item) {
              if (k != this.props.children) {
                ch.parentNode[k] = item[k]
              }
            }
            parentNodes[item.id + ''] = ch.parentNode
          }
        })
        data.push(item)
      })
      this.treeNode = val
    }
  }
}
</script>
<style scoped>
    .dialog-box {
        display: flex;
    }

    .tree-warper {
        padding: 10px;
        border: solid 1px #d2d8e4;
        border-radius: 5px;
    }

    .tree-box {
        margin-top: 10px;
        height: 240px;
        overflow: auto;
    }

    .list-warper {
        padding: 10px;
        border: solid 1px #d2d8e4;
        border-radius: 5px;
    }

    .list-item {
        padding: 0 1em;
        width: calc(100% - 2em);
        height: 32px;
        line-height: 31px;
        color: #666;
        border-bottom: solid 1px #d2d8e4;
        position: relative;
    }

    .list-item:nth-last-child(1) {
        border: none;
    }

    .list-item .btn {
        position: absolute;
        top: 5px;
        right: 5px;
        display: none;
    }

    .list-item:hover {
        background-color: #66b1ff;
        color: #fff;
    }

    .list-item:hover .btn {
        display: block;
        color: #fff;
    }
</style>
