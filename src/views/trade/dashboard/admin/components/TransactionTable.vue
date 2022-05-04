<template>
  <el-table :data="list" stripe border show-summary	sum-text="合计" style="width: 100%;padding-top: 15px;">
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
      list: null
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
    }
  }
}
</script>
