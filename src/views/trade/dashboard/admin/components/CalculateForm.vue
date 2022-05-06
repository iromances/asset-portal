<template>
  <div style="background-color: #fff;padding:16px 16px 0;">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
        <el-form ref="form" label-width="120px">
          <el-form-item label="投资组合规模">
            <el-input v-model="form.totalAmount" width="120px" clearable placeholder="请输入投资规模" />
          </el-form-item>
          <el-form-item label="期望收益">
            <el-input v-model="form.expectYield" clearable placeholder="请输入期望的收益率">
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="头寸大小">
            <el-input v-model="form.cashPosition" prefix="%" clearable placeholder="请输入每次投资的头寸大小，建议25">
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="平均收益">
            <el-input v-model="form.avgYield" clearable placeholder="请输入平均收益率">
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="平均亏损">
            <el-input v-model="form.avgLossRate" clearable placeholder="请输入平均亏损率">
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="平均成功率">
            <el-input v-model="form.avgAccuracy" clearable placeholder="请输入平均成功率">
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="calc">立即计算</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
        <el-form ref="form" label-width="150px">
          <el-form-item label="成功的平均收益">
            <el-input v-model="calcResult.successAvgYield" readonly />
          </el-form-item>
          <el-form-item label="成功的笔数">
            <el-input v-model="calcResult.successNum" readonly />
          </el-form-item>
          <el-form-item label="失败的平均亏损">
            <el-input v-model="calcResult.failedAvgLoss" readonly />
          </el-form-item>
          <el-form-item label="失败的笔数">
            <el-input v-model="calcResult.failedNum" readonly />
          </el-form-item>
          <el-form-item label="收益风险比">
            <el-input v-model="calcResult.profitLoss" readonly />
          </el-form-item>
          <el-form-item label="头寸大小">
            <el-input v-model="calcResult.cashPosition" readonly />
          </el-form-item>
          <el-form-item label="预期每笔净收益率">
            <el-input v-model="calcResult.expectNetEarningRate" readonly>
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="预期每笔净收入金额">
            <el-input v-model="calcResult.expectNetEarningAmount" readonly />
          </el-form-item>
          <el-form-item label="目标金额">
            <el-input v-model="calcResult.tartgetEarningAmount" readonly />
          </el-form-item>
          <el-form-item label="所需投资数量">
            <el-input v-model="calcResult.needTradeNum" readonly />
          </el-form-item>
          <el-form-item label="调整后的收益风险比">
            <el-input v-model="calcResult.adjustProfitLoss" readonly />
          </el-form-item>
          <el-form-item label="最佳值">
            <el-input v-model="calcResult.bestRate" readonly>
              <template slot="suffix">%</template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      form: {
        totalAmount: null,
        // 期望收益
        expectYield: null,
        // 头寸大小
        cashPosition: 25,
        // 平均收益
        avgYield: 0.14,
        // 平均亏损
        avgLossRate: 0.07,
        // 平均成功率
        avgAccuracy: 0.46
      },
      calcResult: {
        // 成功的平均收益
        successAvgYield: null,
        // 失败的平均亏损
        failedAvgLoss: null,
        // 成功的笔数
        successNum: null,
        // 失败的笔数
        failedNum: null,
        // 收益风险比
        profitLoss: null,
        // 头寸大小
        cashPosition: null,
        // 预期每笔净收益率 = 平均收益 * 胜率 - (1-胜率) * 平均亏损
        expectNetEarningRate: null,
        // 预期每笔净收入金额
        expectNetEarningAmount: null,
        // 目标金额
        tartgetEarningAmount: null,
        // 所需投资数量
        needTradeNum: null,
        // 调整后的收益风险比
        adjustProfitLoss: null,
        // 最佳值？？？
        bestRate: null
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      request({
        url: 'http://localhost:8888/asset/dashboard/avg',
        method: 'get'
      }).then(response => {
        // 平均收益
        this.form.avgYield = response.data.avgYield
        // 平均亏损
        this.form.avgLossRate = response.data.avgLossRate
        // 平均成功率
        this.form.avgAccuracy = response.data.avgAccuracy
      })
    },
    calc() {
      request({
        url: 'http://localhost:8888/asset/rbaf/calc',
        method: 'post',
        data: this.form
      }).then(response => {
        this.calcResult = response.data
        this.$notify({
          title: '提示',
          message: '计算成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
