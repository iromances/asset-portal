<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.serialNo" placeholder="流水号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.stockCode" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.stockName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="交易状态" multiple collapse-tags clearable style="width: 180px" class="filter-item">
        <el-option v-for="item in statusArray" :key="item.key" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="success" icon="el-icon-upload2" @click="uploadDialogVisible = true">
        上传明细
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
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')" />
      <el-table-column label="流水" prop="serialNo" sortable="custom" align="center" width="300" :class-name="getSortClass('id')" />
      <el-table-column label="资产类型" prop="stockType" align="center" />
      <el-table-column label="代码" prop="stockCode" align="center" />
      <el-table-column label="名称" prop="stockName" width="250" align="center" />
      <el-table-column label="交易方向" prop="direction" align="center" />
      <el-table-column label="交易状态" prop="status" align="center" />
      <el-table-column label="订单类型" width="120px" prop="orderType" align="center" />
      <el-table-column label="期限" prop="periodValidity" align="center" />
      <el-table-column label="盘前盘后" prop="preOrAfterMarket" align="center" />
      <el-table-column label="卖空" prop="sellingShort" align="center" />
      <el-table-column label="订单来源" prop="orderSource" align="center" />
      <el-table-column label="下单时间" prop="orderTime" width="170" align="center">
        <template slot-scope="scope">
          <span>{{ parse2Time(scope.row.orderTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单价格" prop="orderPrice" align="center" />
      <el-table-column label="下单数量" prop="orderNum" align="center" />
      <el-table-column label="已成交" prop="avgPrice" align="center" />
      <el-table-column label="触发价" prop="triggerPrice" align="center" />
      <el-table-column label="成交数量" prop="dealNum" align="center" />
      <el-table-column label="成交价格" prop="dealPrice" align="center" />
      <el-table-column label="成交金额" prop="dealAmount" align="center" />
      <el-table-column label="成交时间" prop="dealTime" width="170" align="center">
        <template slot-scope="scope">
          <span>{{ parse2Time(scope.row.dealTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合计费用" prop="totalAmount" align="center" />
      <el-table-column label="佣金" prop="brokerage" align="center" />
      <el-table-column label="平台使用费" width="90" prop="platformFee" align="center" />
      <el-table-column label="交收费" prop="stockSettlementFee" align="center" />
      <el-table-column label="证监会规费" width="90" prop="sfcFees" align="center" />
      <el-table-column label="交易活动费" width="90" prop="transActivityFee" align="center" />
      <el-table-column label="期权清算费" width="90" prop="optionClearingFee" align="center" />
      <el-table-column label="交易所费用" width="90" prop="exchangeCost" align="center" />
      <el-table-column label="订单匹配标识" width="120" prop="matchFlag" align="center" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog
      title="上传历史交易明细文件"
      :visible.sync="uploadDialogVisible"
      :close-on-click-modal="false"
      width="700px"
      @closed="handleUploadDialogClosed"
    >
      <el-form ref="form" label-width="120px">
        <el-form-item label="券商">
          <el-select v-model="uploadData.broker" placeholder="请选择" style="width: 180px" class="filter-item">
            <el-option v-for="item in brokersArray" :key="item.key" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易明细">
          <el-upload
            class="upload-demo"
            action="http://localhost:8888/asset/attachment/upload"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :limit="1"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
            drag
            show-file-list
            :file-list="fileList"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTradeFile">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, submitFile } from '@/api/tradeHistoryDetailApi'
import { parse2Time } from '@/utils/index'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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
  name: 'TradeHistoryDetail',
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
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      pvData: [],
      statusArray: [
        { key: '1', label: '全部成交', value: '全部成交' },
        { key: '2', label: '已撤单', value: '已撤单' },
        { key: '3', label: '部成已撤', value: '部成已撤' }
      ],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      uploadDialogVisible: false,
      brokersArray: [
        { key: '1', label: '富途牛牛', value: 'FTNN' },
        { key: '2', label: '老虎', value: 'TIGER' }
      ],
      uploadData: {
        broker: 'FTNN',
        attachmentId: null
      },
      fileList: [
        // { name: '', url: '', id:'' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parse2Time,
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
    handleUploadDialogClosed() {
      this.uploadData.attachmentId = null
      this.fileList = []
    },
    submitTradeFile() {
      if (!this.uploadData.attachmentId) {
        this.$notify({
          title: '提示',
          message: '请先上传交易明细文件！ ',
          type: 'warning'
        })
        return
      }
      submitFile(this.uploadData).then(response => {
        console.log(response)
        this.uploadDialogVisible = false
        this.$notify({
          title: '提示',
          message: '文件解析成功！',
          type: 'success'
        })
      })
    },
    // 上传
    handleRemove(file, fileList) {
      this.uploadData.attachmentId = null
    },
    handleExceed(files, fileList) {
      this.$notify({
        title: '警告',
        message: '当前限制选择 1 个文件，超出限制 ',
        type: 'warning'
      })
    },
    handleSuccess(response, file, fileList) {
      this.uploadData.attachmentId = response.data
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    }
  }
}
</script>
