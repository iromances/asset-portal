<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.startDate" placeholder="起始日期" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.endDate" placeholder="结束日期" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.tips" placeholder="标签" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="insertDialogVisible = true">
        新增
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="showUpdateDialog">
        修改
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      highlight-current-row
      :height="tableHeight"
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="发生日期" prop="occurrenceDate" sortable="custom" align="center" />
      <el-table-column label="标题" prop="title" align="center" />
      <el-table-column label="副标题" prop="subTitle" align="center" />
      <el-table-column label="内容" prop="content" align="center" />
      <el-table-column label="标签" prop="tips" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="新增" :visible.sync="insertDialogVisible" :close-on-click-modal="false" width="700px" @closed="handleSaveDialogClosed">
      <el-form ref="newsSaveForm" :model="newsSaveForm" label-width="120px">
        <el-form-item label="发生日期">
          <el-date-picker
            v-model="newsSaveForm.occurrenceDate"
            class="filter-item"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="newsSaveForm.title" class="filter-item" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="newsSaveForm.subTitle" class="filter-item" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="newsSaveForm.content" type="textarea" class="filter-item" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="newsSaveForm.tips" class="filter-item" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="insertDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveNews">保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改" :visible.sync="updateDialogVisible" :close-on-click-modal="false" width="700px" @closed="handleUpdateDialogClosed">
      <el-form ref="newsUpdateForm" :model="newsUpdateForm" label-width="120px">
        <el-form-item label="发生日期">
          <el-date-picker
            v-model="newsUpdateForm.occurrenceDate"
            class="filter-item"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="newsUpdateForm.title" class="filter-item" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="newsUpdateForm.subTitle" class="filter-item" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="newsUpdateForm.content" type="textarea" class="filter-item" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="newsUpdateForm.tips" class="filter-item" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="insertDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateNews">修 改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/NewsApi'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import axios from 'axios' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'News',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableHeight: document.documentElement.clientHeight - 309 + 'px',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      newsSaveForm: {
        occurrenceDate: new Date()
      },
      newsUpdateForm: {},
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      insertDialogVisible: false,
      updateDialogVisible: false,
      multipleSelection: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    saveNews() {
      axios({
        url: 'http://localhost:8888/asset/news/save',
        method: 'post',
        data: this.newsSaveForm
      }).then(response => {
        console.log(response)
        this.insertDialogVisible = false
        this.getList()
        this.$notify({
          title: '提示',
          message: '保存成功！',
          type: 'success'
        })
      })
    },
    showUpdateDialog() {
      if (this.multipleSelection.length !== 1) {
        this.$notify({
          title: '提示',
          message: '请选择一条数据进行编辑！',
          type: 'warning'
        })
        return
      }
      var id = this.multipleSelection[0].id
      var _this = this
      axios({
        url: 'http://localhost:8888/asset/news/' + id,
        method: 'get'
      }).then(response => {
        console.log(response.data.data)
        _this.updateDialogVisible = true
        this.newsUpdateForm = response.data.data
      })
    },
    updateNews() {
      axios({
        url: 'http://localhost:8888/asset/news/update',
        method: 'put',
        data: this.newsUpdateForm
      }).then(response => {
        console.log(response.data.data)
        this.updateDialogVisible = false
        this.getList()
        this.$notify({
          title: '提示',
          message: '更新成功！',
          type: 'success'
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSaveDialogClosed() {
      this.$refs['newsSaveForm'].resetFields()
      this.newsSaveForm = {
        occurrenceDate: new Date()
      }
    },
    handleUpdateDialogClosed() {
      this.$refs['newsUpdateForm'].resetFields()
    }
  }
}
</script>
