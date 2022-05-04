<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.stockCode" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.stockName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker
        v-model="listQuery.transMonth"
        class="filter-item"
        type="month"
        value-format="yyyy-MM"
        placeholder="交易月"
      />
      <!--      <el-date-picker
        class="filter-item"
        v-model="listQuery.endOutDate"
        type="date"
        placeholder="结束交易日期">
      </el-date-picker>-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-s-operation" @click="generateMonthlyReport">
        月度报表
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
      <el-table-column label="代码" prop="stockCode" align="center">
        <template slot-scope="scope">
          <a size="mini" style="margin-right: 2px;color: #1890ff;" type="text" @click="stockCodeClick(scope.row)">
            {{ scope.row.stockCode }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="stockName" width="250" align="center" />
      <el-table-column label="市场" prop="market" sortable="custom" align="center" :class-name="getSortClass('id')" />
      <el-table-column label="交易方向" prop="position" align="center" />
      <el-table-column label="进场时间" prop="approachTime" width="180" align="center">
        <template slot-scope="scope">
          <span>{{ parse2Time(scope.row.approachTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单数量" prop="orderNum" align="center" />
      <el-table-column label="进场价格" prop="purchasePrice" align="center" />

      <el-table-column label="进场佣金" prop="inBrokerage" align="center" />
      <el-table-column label="进场杂费" prop="inOtherAmount" align="center" />
      <el-table-column label="进场费用合计" prop="inTotalAmount" align="center" />
      <el-table-column label="出场时间" prop="outTime" width="180" align="center">
        <template slot-scope="scope">
          <span>{{ parse2Time(scope.row.outTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="出场价格" prop="outPrice" align="center" />
      <el-table-column label="出场佣金" prop="outBrokerage" align="center" />
      <el-table-column label="出场杂费" prop="outOtherAmount" align="center" />
      <el-table-column label="出场费用合计" prop="outTotalAmount" align="center" />
      <el-table-column label="损益情况" width="85" prop="profitLossSituationNoFee" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.profitLossSituationNoFee + '%' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="损益情况(含手续费)" width="90" prop="profitLossSituation" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.profitLossSituation + '%' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="交易系统名称" prop="tradingSystem" align="center" />
      <el-table-column label="价格通道" prop="priceChannel" align="center" />
      <el-table-column label="进场表现得分" prop="inScore" align="center" />
      <el-table-column label="出场表现得分" prop="outScore" align="center" />

      <el-table-column label="交易总得分" prop="totalScore" align="center" />
      <el-table-column label="止损点" prop="lossLimit" align="center" />
      <el-table-column label="滑点损失" prop="slippageLoss" align="center" />

      <el-table-column label="进场原因" prop="inReason" align="center" />
      <el-table-column label="出场原因" prop="outReason" align="center" />

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog
      title="交易明细"
      :visible.sync="tradeDetailsDialogVisible"
      width="80%"
      height="500px"
      @closed="handleTradeDetailsDialogClosed"
    >

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="tradeDetailList"
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
      >
        <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')" />
        <el-table-column label="代码" prop="stockCode" align="center" />
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
      </el-table>

    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/tradeRecordApi'
import { parse2Time } from '@/utils/index'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { fetchByRecordId } from '@/api/tradeHistoryDetailApi'
import request from '@/utils/request' // secondary package based on el-pagination

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
  name: 'TradeRecord',
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
      tradeDetailsDialogVisible: false,
      tradeDetailList: []
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
        console.log(response)
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
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
    stockCodeClick(row) {
      fetchByRecordId(row.id).then(response => {
        console.log(response)
        this.tradeDetailList = response.data
        this.tradeDetailsDialogVisible = true
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    handleTradeDetailsDialogClosed() {

    },
    generateMonthlyReport() {
      request({
        url: 'http://localhost:8888/asset/generate/monthly/trade/report',
        method: 'post',
        data: {}
      }).then(response => {
        this.$notify({
          title: '提示',
          message: '报表生成成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
