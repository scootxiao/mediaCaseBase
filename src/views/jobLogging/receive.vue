<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formData">
        <el-select 
          v-model="formData.keywordType"
          class="filter-item"
          style="width:120px;"
        >
          <el-option label="按照标题" value="title"></el-option>
          <el-option label="按发送部门" value="fromDeptName"></el-option>
          <el-option label="按发送人" value="fromUserName"></el-option>
        </el-select>
        <el-input 
          placeholder="请输入关键字" 
          v-model.trim="formData.keyword" 
          class="filter-item"
          style="width:180px;"
          prefix-icon="el-icon-search"
          maxlength="50" 
        />
        <el-date-picker
          v-model="formData.time"
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          :unlink-panels="true"
          :editable="false"
          :pickerOptions="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
        />
        <el-button type="primary" class="filter-item" icon="search" @click="getReceiveList">搜索</el-button>
        <el-button type="primary" class="filter-item" @click="deleteReceive">删除</el-button>
      </el-form>
    </div>
    <el-table ref="singleTable" border :data="tableData" style="width: 100%" @selection-change="selectionChange">
        <el-table-column type="selection" align="center" width="50" fixed></el-table-column>
        <el-table-column property="title" align="left" label="标题">
            <template slot-scope="scope">
                <a href="#" @click="toRecordPage(scope.row)" v-text="scope.row.title"></a>
            </template>
        </el-table-column>
        <el-table-column property="sendCount" align="center" width="120px" label="数量"></el-table-column>
        <el-table-column property="fromUserName" align="center" label="发送人" width="150px"
                          show-overflow-tooltip></el-table-column>
        <el-table-column property="fromDeptName" align="center" label="发送部门" width="150px"
                          show-overflow-tooltip></el-table-column>
        <el-table-column property="createTime" align="center" label="接收时间" width="180px"
                          show-overflow-tooltip></el-table-column>
    </el-table>
    <pagination
      v-show="pagination.peopleCount>0"
      :total="pagination.peopleCount"
      :page.sync="pagination.currentPage"
      :limit.sync="pagination.pageSize"
      @pagination="getReceiveList()"
    />
  </div>
</template>

<script>
// import {formatDate} from "@/util/date.js";
import Pagination from '@/components/Pagination'
import {
  receiveTableData,
  receiveTableDelete
} from '@/api/job'

export default {
  name: 'JobLoggingreceive',
  data() {
    return {
      formData: {
        keywordType: 'title',
        keyword: '',
        time: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 20,
        peopleCount: 0
      },
      showPage: true,
      // minDateStamp: new Date(new Date().add(-3, 'year').format('yyyy-12-31 24:00:00')).getTime(),
      pickerOptions: {
        // disabledDate: (date) => {
        //   const stamp = new Date(date).getTime()
        //   return new Date().getTime() < stamp || this.minDateStamp > stamp
        // }
      },
      tableData: [],
      selectedData: []
    }
  },
  components: {
    Pagination,
  },
  created() {
    let query = this.$route.query;
    let pager = ''
    if (query.id) {
        this.formData = {
            keywordType: query.keywordType || 'title',
            keyword: query.keyword || '',
            time: query.time || '',
        };
        this.pagination.currentPage = query.currentPage ? parseInt(query.currentPage) : 1;
        pager = 'pager'
    }
    this.getReceiveList(pager);
  },
  methods: {
    toRecordPage(row) {
        let query = Object.assign({
            id: row.id,
            currentPage: this.pagination.currentPage
        }, this.formData);
        this.$router.push({
            path: '/jobLogging/receiveTable',
            query,
        })
    },
    async getReceiveList(from) {
      if ('pager' !== from) {
          this.showPage = false;
          this.pagination.currentPage = 1;
          this.$nextTick(() => {
              this.showPage = true;
          })
      }
      this.showLoading("加载中，请稍侯...")
      let startTime = (this.formData.time || [])[0];
      let endTime = (this.formData.time || [])[1];

      let {code, data:{records, total}} = await receiveTableData({
          current: this.pagination.currentPage,
          size: this.pagination.pageSize,
          title: 'title' == this.formData.keywordType ? this.formData.keyword : '',
          fromDeptName: 'fromDeptName' == this.formData.keywordType ? this.formData.keyword : '',
          fromUserName: 'fromUserName' == this.formData.keywordType ? this.formData.keyword : '',
          startTime: startTime ? startTime + " 00:00:00" : '',
          endTime: endTime ? endTime + " 23:59:59" : ''
      });
      this.tableData = records;
      this.pagination.peopleCount = total;
      this.loading.close();
    },
    selectionChange(selection) {
        this.selectedData = selection;
    },
    async deleteReceive() {
        let ids = this.selectedData.map(item => item.id).join(",");
        if (!ids) {
            this.$message({
                type: 'warning',
                message: '需选择删除项'
            })
            return;
        }
        await this.$confirm("您确定要删除勾选的数据吗？")
        this.showLoading("正在处理，请稍候...")
        
        let {code, msg, data} = await receiveTableDelete(ids);
        if (code == '0') {
            this.$message({type: 'success',message: '删除成功'})
            this.getReceiveList();
        } else {
            this.$message({type: 'error',message: msg})
        }
        this.loading.close();
    },
    showLoading(tips) {
        this.loading = this.$loading({
            lock: true,
            text: tips,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
        });
    },
  }
}
</script>

<style scoped>

</style>
