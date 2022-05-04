<template>
  <div>
    <el-table :data="list" stripe border show-summary :summary-method="getSummaries" style="width: 100%;padding-top: 15px;">
      <el-table-column label="日期" prop="tradeMonth" width="120" align="center" />
      <el-table-column label="平均收益" prop="avgYield" align="center">
        <template slot-scope="scope">
          <span style="color: #2ac06d">{{ scope.row.avgYield? scope.row.avgYield+ '%':'' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平均亏损" prop="avgLossRate" align="center">
        <template slot-scope="scope">
          <span style="color: orangered">{{ scope.row.avgLossRate? scope.row.avgLossRate+ '%':'' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成功百分比" prop="avgAccuracy" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.avgAccuracy? scope.row.avgAccuracy+ '%':'' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总交易笔数" prop="tradeNum" align="center" />
      <el-table-column label="最大收益" prop="maxYield" align="center">
        <template slot-scope="scope">
          <span style="color: #2ac06d">{{ scope.row.maxYield? scope.row.maxYield+ '%':'' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最大亏损" prop="maxLoss" align="center">
        <template slot-scope="scope">
          <span style="color: orangered">{{ scope.row.maxLoss? scope.row.maxLoss+ '%':'' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平均收益上涨日" prop="yieldDay" align="center" />
      <el-table-column label="平均亏损下跌日" prop="lossDay" align="center" />
    </el-table>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: null,
      summaryData: {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      var data = {}
      request({
        url: 'http://localhost:8888/asset/monthly/trade/report',
        method: 'get',
        param: data
      }).then(response => {
        this.list = response.data.records
      })

      request({
        url: 'http://localhost:8888/asset/monthly/trade/summary/report',
        method: 'get',
        param: data
      }).then(response => {
        this.summaryData = response.data
      })
    },
    // 金额合计
    getSummaries(param) {
      var _this = this
      const { columns } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        switch (column.property) {
          case 'avgYield':
          case 'avgLossRate':
          case 'avgAccuracy':
            sums[index] = '-'
            break
          case 'tradeNum':
            sums[index] = _this.summaryData.tradeNum ? _this.summaryData.tradeNum + '%' : ''
            break
          case 'maxYield':
            sums[index] = _this.summaryData.maxYield ? _this.summaryData.maxYield + '%' : ''
            break
          case 'maxLoss':
            sums[index] = _this.summaryData.maxLoss ? _this.summaryData.maxLoss + '%' : ''
            break
          case 'yieldDay':
            sums[index] = _this.summaryData.yieldDay ? _this.summaryData.yieldDay : ''
            break
          case 'lossDay':
            sums[index] = _this.summaryData.lossDay ? _this.summaryData.lossDay : ''
            break
          default:
            sums[index] = ''
            break
        }
      })
      return sums
    }
  }
}
</script>
