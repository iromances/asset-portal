<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import request from '@/utils/request'

const animationDuration = 3000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        xaxis: [],
        data: []
      },
      color: ['#5470C6', '#91CC75', '#EE6666']
    }
  },
  created() {

  },
  mounted() {
    request({
      url: 'http://localhost:8888/asset/trade/record/distribute',
      method: 'post',
      data: {}
    }).then(response => {
      this.chartData = response.data
      this.$nextTick(() => {
        this.initChart()
      })
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        title: {
          text: '损益分布'
          // textAlign: 'center'
        },
        xAxis: [{
          type: 'category',
          data: this.chartData.xaxis,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value',
          name: '笔数',
          position: 'left',
          axisTick: {
            show: true
          }
        }],
        series: [{
          name: 'count',
          type: 'bar',
          stack: 'vistors',
          barWidth: '60%',
          barCategoryGap: '50%',
          data: this.chartData.data,
          animationDuration,
          // 柱子的样式，可以在data里设置单个的数据
          itemStyle: {
            barBorderRadius: 5,
            borderWidth: 1,
            borderType: 'solid',
            borderColor: '#73c0de',
            shadowColor: '#5470c6',
            shadowBlur: 1
          }
        }, {
          name: 'percent',
          type: 'line',
          smooth: true, // 曲线更平滑
          data: this.chartData.data,
          animationDuration
        }]
      })
    }
  }
}
</script>
