<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.stockCode" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.stockName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker
        v-model="listQuery.tradeDate"
        align="right"
        type="date"
        placeholder="交易日期"
        class="filter-item"
        value-format="yyyy-MM-dd"
        :picker-options="pickerOptions"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <!--      <el-upload
        class="upload-demo"
        action="http://localhos:8888/asset/attachment/upload"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        multiple
        :limit="1"
        :on-exceed="handleExceed"
        :file-list="fileList">
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="downloadNewStock">
        下载扫描模板
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
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="排名" prop="seq" align="center" />
      <el-table-column label="交易日期" prop="tradeDate" width="100" align="center" />
      <el-table-column label="代码" prop="stockCode" align="center" />
      <el-table-column label="名称" prop="stockName" width="250" align="center" />
      <el-table-column label="所属行业" prop="industry" width="100" align="center" />

      <el-table-column label="最新价" prop="latestPrice" align="center" />
      <el-table-column label="涨跌额" prop="riseFallAmount" align="center" />
      <el-table-column label="涨跌幅" prop="riseFallPercent" align="center" />

      <el-table-column label="成交量" prop="volume" align="center" />
      <el-table-column label="成交额" prop="turnover" width="170" align="center" />
      <el-table-column label="总市值" width="120px" prop="marketValue" align="center" />
      <el-table-column label="离52周高点百分比" prop="highPointWeek52" align="center" />
      <el-table-column label="离52周低点百分比" prop="lowPointWeek52" align="center" />
      <el-table-column label="MA50" prop="day50ma" align="center" />
      <el-table-column label="MA150" prop="day150ma" align="center" />
      <el-table-column label="MA200" prop="day200ma" align="center" />
      <el-table-column label="买入价" prop="buyPrice" align="center" />
      <el-table-column label="卖出价" prop="sellPrice" align="center" />

      <el-table-column label="买量" prop="buyVolume" align="center" />
      <el-table-column label="卖量" prop="sellVolume" align="center" />

      <el-table-column label="今开" prop="todayOpeningPrice" align="center" />
      <el-table-column label="昨收" prop="lastDayClosingPrice" align="center" />
      <el-table-column label="最高" prop="highestPrice" align="center" />
      <el-table-column label="最低" prop="lowestPrice" align="center" />
      <el-table-column label="量比" prop="liangbi" align="center" />
      <el-table-column label="委比" prop="weibi" align="center" />
      <el-table-column label="振幅" prop="zhenfu" align="center" />
      <el-table-column label="市盈率" prop="pe" align="center" />

      <el-table-column label="换手率" prop="turnoverRate" align="center" />
      <el-table-column label="涨跌速率" prop="riseFallSpeedPercent" align="center" />
      <el-table-column label="5分钟涨跌幅" prop="min5RiseFallPercent" align="center" />
      <el-table-column label="5日涨跌幅" prop="day5RiseFallPercent" align="center" />
      <el-table-column label="10日涨跌幅" prop="day10RiseFallPercent" align="center" />
      <el-table-column label="20日涨跌幅" prop="day20RiseFallPercent" align="center" />
      <el-table-column label="60日涨跌幅" prop="day60RiseFallPercent" align="center" />
      <el-table-column label="120日涨跌幅" prop="day120RiseFallPercent" align="center" />
      <el-table-column label="250日涨跌幅" prop="day250RiseFallPercent" align="center" />
      <el-table-column label="年初至今涨跌幅" prop="thisYearRiseFallPercent" align="center" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="下载" :visible.sync="downloadDialogVisible" width="500px">
      <el-form ref="form" label-width="120px">
        <el-form-item label="请选择市场">
          <el-select v-model="market" value="M" placeholder="请选择市场" clearable style="width: 220px" class="filter-item">
            <el-option v-for="item in marketArray" :key="item.key" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易日期">
          <el-date-picker
            v-model="downloadTradeDate"
            align="right"
            type="date"
            placeholder="yyyy-MM-dd"
            class="filter-item"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="downloadDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDownload">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/DailyMarketApi'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import axios from 'axios'

export default {
  name: 'DayilyMarket',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableHeight: document.documentElement.clientHeight - 309 + 'px',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      fileList: [],
      marketArray: [
        { key: '1', label: '美股', value: 'M' },
        { key: '2', label: '港股', value: 'H' },
        { key: '3', label: '沪深', value: 'A' }
      ],
      market: '',
      downloadTradeDate: null,
      downloadDialogVisible: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
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
    downloadNewStock() {
      this.downloadDialogVisible = true
    },
    confirmDownload() {
      axios({
        url: 'http://localhost:8888/asset/trade/daily/market/download' + '?tradeDate=' + this.downloadTradeDate + '&market=' + this.market,
        method: 'post',
        data: {
          tradeDate: this.downloadTradeDate,
          market: this.market
        },
        responseType: 'blob'
      }).then(result => {
        console.log(result)
        const url = window.URL.createObjectURL(new Blob([result.data]))
        const fileName = this.market + '_' + this.downloadTradeDate + '.ebk'
        const link = document.createElement('a')
        link.download = fileName
        link.style.display = 'none'
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }
  }
}
</script>
