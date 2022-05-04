<template>
  <div>
    <el-form ref="form" label-width="120px">
      <el-form-item label="投资组合规模">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="头寸大小">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="期望收益">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="平均收益">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="平均亏损">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="平均成功率">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即计算</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      form: {}
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
    }
  }
}
</script>
